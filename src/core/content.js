import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const CONTENT_STATUSES = Object.freeze(['UNREVIEWED_DRAFT', 'IN_REVIEW', 'REVIEWED', 'PUBLISHED']);

export function validateItem(item) {
  const errors = [];
  if (!item || typeof item !== 'object') return ['item must be an object'];
  if (typeof item.id !== 'string' || !item.id.trim()) errors.push('id is required');
  if (typeof item.conceptId !== 'string' || !item.conceptId.trim()) errors.push('conceptId is required');
  if (!Array.isArray(item.options) || item.options.length < 2) errors.push('at least two options are required');
  const allowed = Array.isArray(item.allowedMisconceptionIds) ? item.allowedMisconceptionIds : null;
  if (!allowed) errors.push('allowedMisconceptionIds must be an array');
  else {
    if (allowed.some((id) => typeof id !== 'string' || !id.trim())) errors.push('allowedMisconceptionIds must contain non-empty strings');
    if (new Set(allowed).size !== allowed.length) errors.push('allowedMisconceptionIds must not contain duplicates');
  }
  if (Array.isArray(item.options)) {
    const ids = new Set();
    const referencedMisconceptions = new Set();
    for (const option of item.options) {
      if (!option || typeof option.id !== 'string' || !option.id.trim() || typeof option.text !== 'string' || !option.text.trim()) {
        errors.push('each option needs a non-empty id and text');
        continue;
      }
      if (ids.has(option.id)) errors.push(`duplicate option id: ${option.id}`);
      ids.add(option.id);
      if (option.misconceptionId != null && allowed && !allowed.includes(option.misconceptionId)) {
        errors.push(`option ${option.id} maps to an unallowed misconception`);
      }
      if (option.id === item.correctOptionId) {
        if (option.misconceptionId != null) errors.push(`correct option ${option.id} must not map to a misconception`);
      } else {
        if (typeof option.misconceptionId !== 'string' || !option.misconceptionId.trim()) {
          errors.push(`incorrect option ${option.id} must map to a misconception`);
        } else if (allowed && !allowed.includes(option.misconceptionId)) {
          errors.push(`option ${option.id} maps to an unallowed misconception`);
        } else {
          referencedMisconceptions.add(option.misconceptionId);
        }
      }
    }
    if (typeof item.correctOptionId !== 'string' || !ids.has(item.correctOptionId)) errors.push('correctOptionId must reference an option');
    if (allowed) {
      for (const id of allowed) if (!referencedMisconceptions.has(id)) errors.push(`allowed misconception ${id} is not mapped by an incorrect option`);
    }
  }
  if (!CONTENT_STATUSES.includes(item.status)) errors.push('invalid content status');
  if (!item.review || typeof item.review !== 'object') errors.push('review metadata is required');
  else {
    if (item.review.status !== item.status) errors.push('item and review status must match');
    if (['REVIEWED', 'PUBLISHED'].includes(item.status)) {
      if (typeof item.review.reviewer !== 'string' || !item.review.reviewer.trim()) errors.push('reviewer is required for reviewed/published content');
      if (typeof item.review.reviewedAt !== 'string' || !item.review.reviewedAt.trim() || Number.isNaN(Date.parse(item.review.reviewedAt))) errors.push('valid reviewedAt timestamp is required for reviewed/published content');
    }
  }
  return errors;
}

export function loadPack(file = path.resolve(here, '../../content/electricity-pack.json')) {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(parsed.items)) throw new Error('content pack items must be an array');
  const errors = parsed.items.flatMap((item) => validateItem(item).map((error) => `${item?.id ?? '<unknown>'}: ${error}`));
  if (errors.length) throw new Error(`Invalid content pack:\n${errors.join('\n')}`);
  return parsed;
}

export function selectPublishedItems(pack) {
  const languageBridgeReady = !pack.languageBridge || ['REVIEWED', 'PUBLISHED'].includes(pack.languageBridge.status);
  if (!languageBridgeReady) return [];
  return pack.items.filter((item) => item.status === 'PUBLISHED' && item.review?.status === 'PUBLISHED' && (!item.bridge || item.bridge.status === 'PUBLISHED'));
}
