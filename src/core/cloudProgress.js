const ID_RE = /^[A-Za-z0-9_-]{1,100}$/;
const DIAGNOSIS_TYPES = new Set(['MISCONCEPTION', 'NONE', 'UNCERTAIN']);

// Cloud schema intentionally excludes free-text explanations, drafts, retry queues and traces.
export function toCloudAttempt(answer) {
  if (!answer || typeof answer !== 'object' || !ID_RE.test(String(answer.id || '')) || !ID_RE.test(String(answer.itemId || '')) || !ID_RE.test(String(answer.optionId || ''))) return null;
  const submittedAt = typeof answer.submittedAt === 'string'
    && /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$/.test(answer.submittedAt)
    && Number.isFinite(Date.parse(answer.submittedAt)) ? answer.submittedAt : null;
  if (!submittedAt) return null;
  const diagnosisType = DIAGNOSIS_TYPES.has(answer.diagnosis?.type) ? answer.diagnosis.type : 'UNCERTAIN';
  const misconceptionId = diagnosisType === 'MISCONCEPTION'
    ? (typeof answer.diagnosis?.misconceptionId === 'string' && ID_RE.test(answer.diagnosis.misconceptionId) ? answer.diagnosis.misconceptionId : null)
    : null;
  if (diagnosisType === 'MISCONCEPTION' && !misconceptionId) return null;
  return { schemaVersion: 1, itemId: answer.itemId, optionId: answer.optionId, submittedAt, diagnosisType, misconceptionId };
}

export function fromCloudAttempt(id, value) {
  const attempt = toCloudAttempt({ id, ...value, diagnosis: { type: value?.diagnosisType, misconceptionId: value?.misconceptionId } });
  if (!attempt) return null;
  return {
    id,
    itemId: attempt.itemId,
    optionId: attempt.optionId,
    explanation: '',
    submittedAt: attempt.submittedAt,
    mode: 'CLOUD_SYNCED_PROGRESS',
    diagnosis: { type: attempt.diagnosisType, misconceptionId: attempt.misconceptionId, confidence: 0, rationale: 'Synced answer history; no written reasoning or diagnosis rationale is stored in the cloud.', provisional: true },
    reviewStatus: 'UNREVIEWED_DRAFT'
  };
}

export function mergeCloudAttempts(localAnswers, cloudAnswers, max = 500) {
  const byId = new Map();
  for (const answer of [...(Array.isArray(cloudAnswers) ? cloudAnswers : []), ...(Array.isArray(localAnswers) ? localAnswers : [])]) {
    const clean = answer?.mode === 'CLOUD_SYNCED_PROGRESS' ? fromCloudAttempt(answer.id, {
      schemaVersion: 1,
      itemId: answer.itemId,
      optionId: answer.optionId,
      submittedAt: answer.submittedAt,
      diagnosisType: answer.diagnosis?.type,
      misconceptionId: answer.diagnosis?.misconceptionId
    }) : (() => {
      const projection = toCloudAttempt(answer);
      return projection ? { ...answer, ...projection, diagnosis: { ...answer.diagnosis, type: projection.diagnosisType, misconceptionId: projection.misconceptionId, provisional: true } } : null;
    })();
    if (clean) byId.set(clean.id, clean);
  }
  return [...byId.values()].sort((a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt) || a.id.localeCompare(b.id)).slice(-max);
}

export function cloudLearnerId(profileId) {
  return typeof profileId === 'string' && ID_RE.test(profileId) ? profileId : null;
}
