// Catalogue of deliberate faults ("mutants") used to check that tests/queue-invariants.test.js really notices broken behaviour.
// Each mutant is a small text edit applied to a TEMPORARY COPY of src/core; the shipped source is never changed by this module.
// `required` marks the three families the Iteration 10 brief demands: a = retry timing/limit, b = queue drained on error,
// c = validator accepts a foreign misconception id or confirms uncertainty.
//
// Every `find` text must occur exactly once in its file, so a refactor that moves the code makes the catalogue fail loudly
// (tests/mutation-catalogue.test.js) instead of silently testing nothing.

const edit = (file, find, replace) => ({ file, find, replace });

export const MUTANTS = Object.freeze([
  // ---- (a) retry timing and limit
  { id: 'A1', required: 'a', description: 'backoff exponent off by one (waits 10 s, 20 s, ... instead of 5 s, 10 s, ...)',
    edits: [edit('retry.js', 'p.baseDelayMs * p.factor ** (Math.max(1, failedAttempts) - 1)', 'p.baseDelayMs * p.factor ** Math.max(1, failedAttempts)')] },
  { id: 'A2', required: 'a', description: 'backoff is never capped at maxDelayMs',
    edits: [edit('retry.js', 'Math.min(p.maxDelayMs, p.baseDelayMs', 'Math.min(Infinity, p.baseDelayMs')] },
  { id: 'A3', required: 'a', description: 'retry limit allows one extra automatic attempt (> instead of >=)',
    edits: [edit('retry.js', 'entry.cycleAttempts >= p.maxAutomaticAttempts', 'entry.cycleAttempts > p.maxAutomaticAttempts')] },
  { id: 'A4', required: 'a', description: 'retry limit stops one attempt early',
    edits: [edit('retry.js', 'entry.cycleAttempts >= p.maxAutomaticAttempts', 'entry.cycleAttempts + 1 >= p.maxAutomaticAttempts')] },
  { id: 'A5', required: 'a', description: 'no retry limit at all (entries never pause)',
    edits: [edit('retry.js', 'if (entry.cycleAttempts >= p.maxAutomaticAttempts) {', 'if (false) {')] },
  { id: 'A6', required: 'a', description: 'no backoff scheduled after a failure (immediate hot retry)',
    edits: [edit('retry.js', 'entry.nextAttemptAt = new Date(nowMs + backoffDelayMs(entry.cycleAttempts, p)).toISOString();', 'entry.nextAttemptAt = null;')] },
  { id: 'A7', required: 'a', description: 'a paused entry is treated as due',
    edits: [edit('retry.js', 'if (entry?.needsAttention === true) return false;\n  if (!entry?.nextAttemptAt) return true;', 'if (!entry?.nextAttemptAt) return true;')] },
  { id: 'A8', required: 'a', description: 'default base delay changed from 5 s to 4 s',
    edits: [edit('retry.js', 'baseDelayMs: 5000, factor: 2', 'baseDelayMs: 4000, factor: 2')] },
  { id: 'A9', required: 'a', description: 'entries saved before bounded retry lose their old attempts count',
    edits: [edit('retry.js', 'return Number.isInteger(entry?.attempts) && entry.attempts >= 0 ? entry.attempts : 0;', 'return 0;')] },

  // ---- (b) queue drained or corrupted on provider error
  { id: 'B1', required: 'b', description: 'a provider exception removes the queue entry',
    edits: [edit('agent.js', "const schedule = registerFailure({ state, entry, type: 'recheck_deferred', reason, now, policy, itemId: entry.itemId });", "const schedule = registerFailure({ state, entry, type: 'recheck_deferred', reason, now, policy, itemId: entry.itemId });\n  state.queue = state.queue.filter((candidate) => candidate.id !== queueId);")] },
  { id: 'B2', required: 'b', description: 'a rejected diagnosis removes the queue entry',
    edits: [edit('agent.js', "registerFailure({ state, entry: queueItem, type: 'recheck_rejected', reason: checked.reason, now, policy, itemId: item.id });", "registerFailure({ state, entry: queueItem, type: 'recheck_rejected', reason: checked.reason, now, policy, itemId: item.id });\n    state.queue = state.queue.filter((entry) => entry.id !== queueId);")] },
  { id: 'B3', required: 'b', description: 'an entry is deleted at the moment it pauses',
    edits: [edit('agent.js', '  if (schedule.newlyPaused) {\n', '  if (schedule.newlyPaused) {\n    state.queue = state.queue.filter((candidate) => candidate.id !== entry.id);\n')] },
  { id: 'B4', required: null, description: 'the provider-supplied result is ignored when it is missing (Iteration 9 behaviour: silent local fallback)',
    edits: [edit('agent.js', 'const proposal = providerSupplied ? diagnosisOverride : proposeDiagnosis(', 'const proposal = diagnosisOverride ?? proposeDiagnosis(')] },
  { id: 'B5', required: null, description: 'a rejected diagnosis overwrites the stored answer before it is validated',
    edits: [edit('agent.js', '  const checked = validateDiagnosis(proposal, item);\n  if (!checked.ok) {', '  const checked = validateDiagnosis(proposal, item);\n  if (!checked.ok) {\n    answer.diagnosis = { ...answer.diagnosis, type: "UNCERTAIN", misconceptionId: null };')] },

  // ---- (c) validator and uncertainty
  { id: 'C1', required: 'c', description: 'validator accepts a misconception id from a different question',
    edits: [edit('validator.js', "if (typeof raw.misconceptionId !== 'string' || !item.allowedMisconceptionIds.includes(raw.misconceptionId)) return reject('misconception_not_allowed');", "if (typeof raw.misconceptionId !== 'string') return reject('misconception_not_allowed');")] },
  { id: 'C2', required: 'c', description: 'validator lets an UNCERTAIN or NONE result carry a misconception id, and the planner then confirms it',
    edits: [
      edit('validator.js', "  } else if (raw.misconceptionId != null) {\n    return reject('unexpected_misconception_id');\n  }", '  }'),
      edit('agent.js', "if (diagnosis.type !== 'MISCONCEPTION' || !diagnosis.misconceptionId || !item.allowedMisconceptionIds.includes(diagnosis.misconceptionId)) return;", 'if (!diagnosis.misconceptionId) return;'),
      edit('agent.js', "if (trusted && updated.type === 'MISCONCEPTION' && (changed || prior.provisional)) applyDiagnosisToState(state, updated, item);", 'if (trusted && (changed || prior.provisional)) applyDiagnosisToState(state, updated, item);')
    ] },
  { id: 'C3', required: 'c', description: 'validator accepts a low-confidence misconception (threshold check removed)',
    edits: [edit('validator.js', "if (raw.type !== 'UNCERTAIN' && raw.confidence < 0.65) return reject('below_confidence_threshold');", '')] },
  { id: 'C4', required: null, description: 'validator confidence threshold lowered from 0.65 to 0.60',
    edits: [edit('validator.js', 'raw.confidence < 0.65', 'raw.confidence < 0.60')] },
  { id: 'C5', required: null, description: 'validator ignores a question-id mismatch',
    edits: [edit('validator.js', "if (raw.questionId !== item.id) return reject('question_mismatch');", '')] },
  { id: 'C6', required: null, description: 'validator accepts NaN confidence (finite check removed)',
    edits: [edit('validator.js', "|| !Number.isFinite(raw.confidence)", '')] },
  { id: 'C7', required: null, description: 'validator accepts confidence outside 0..1',
    edits: [edit('validator.js', ' || raw.confidence < 0 || raw.confidence > 1', '')] },
  { id: 'C8', required: null, description: 'validator reports an array as a different kind of problem (reason code drifts)',
    edits: [edit('validator.js', "if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return reject('result_not_object');", "if (!raw || typeof raw !== 'object') return reject('result_not_object');")] },
  { id: 'C9', required: null, description: 'an accepted diagnosis is no longer immutable',
    edits: [edit('validator.js', 'Object.freeze({ questionId: item.id', '({ questionId: item.id')] },

  // ---- other queue, retry, persistence and trace invariants
  { id: 'D1', required: null, description: 'success does not remove the processed entry (it would be processed again)',
    edits: [edit('agent.js', '  state.queue = state.queue.filter((entry) => entry.id !== queueId);\n  const oldCurrent', '  const oldCurrent')] },
  { id: 'D2', required: null, description: 'a background re-check switches the question on screen',
    edits: [edit('agent.js', '  const oldCurrent = state.learner.currentItemId;', '  const oldCurrent = state.learner.currentItemId;\n  state.learner.currentItemId = chooseNextItem(state, pack, item.id, item.conceptId)?.id ?? oldCurrent;')] },
  { id: 'D3', required: null, description: 'manual retry also erases the cumulative attempts history',
    edits: [edit('agent.js', '    entry.cycleAttempts = 0;', '    entry.cycleAttempts = 0;\n    entry.attempts = 0;')] },
  { id: 'D4', required: null, description: 'manual retry does not clear the paused flag',
    edits: [edit('agent.js', '    entry.needsAttention = false;\n    entry.nextAttemptAt = null;\n    delete entry.pausedAt;', '    entry.nextAttemptAt = null;\n    delete entry.pausedAt;')] },
  { id: 'D5', required: null, description: 'a repeated manual retry counts again (not idempotent)',
    edits: [edit('agent.js', '    if (!entry.needsAttention && cycleAttemptsOf(entry) === 0 && !entry.nextAttemptAt) continue;\n', '')] },
  { id: 'D6', required: null, description: 'manual retry of one entry resets every entry',
    edits: [edit('agent.js', '    if (queueId && entry.id !== queueId) continue;\n', '')] },
  { id: 'D7', required: null, description: 'queue capacity allows one entry too many',
    edits: [edit('agent.js', 'if (state.queue.length >= MAX_QUEUE) throw', 'if (state.queue.length > MAX_QUEUE) throw')] },
  { id: 'D8', required: null, description: 'queue capacity is checked after the answer is stored (non-atomic refusal)',
    edits: [
      edit('agent.js', "  if (state.queue.length >= MAX_QUEUE) throw new Error('recheck_queue_full');\n", ''),
      edit('agent.js', '  state.answers.push(answer);\n', "  state.answers.push(answer);\n  if (state.queue.length >= MAX_QUEUE) throw new Error('recheck_queue_full');\n")
    ] },
  { id: 'D9', required: null, description: 'the double-submit guard is removed',
    edits: [edit('agent.js', "throw new Error('already_answered_awaiting_continue');", '/* guard removed */')] },
  { id: 'D10', required: null, description: 'ids are no longer checked for uniqueness (Iteration 9 behaviour)',
    edits: [edit('agent.js', "id: uniqueId('ans', state.answers)", "id: uid('ans')"), edit('agent.js', "id: uniqueId('q', state.queue)", "id: uid('q')")] },
  { id: 'D11', required: null, description: 'failure trace lines coalesce across different queue entries',
    edits: [edit('agent.js', 'if (last && last.type === event.type && last.queueId === event.queueId) {', 'if (last && last.type === event.type) {')] },
  { id: 'D12', required: null, description: 'failure trace lines never coalesce',
    edits: [edit('agent.js', 'if (last && last.type === event.type && last.queueId === event.queueId) {', 'if (false) {')] },
  { id: 'D13', required: null, description: 'the trace is no longer bounded',
    edits: [edit('agent.js', 'if (state.trace.length > MAX_TRACE) state.trace.splice(0, state.trace.length - MAX_TRACE);', '')] },
  { id: 'E1', required: null, description: 'repair keeps duplicate queue ids',
    edits: [edit('recovery.js', 'if (seen.has(entry.id)) {', 'if (false) {')] },
  { id: 'E2', required: null, description: 'repair adds a trace line even when nothing needed repair (not idempotent)',
    edits: [edit('recovery.js', 'if (!repairKeys.length) return { state: structuredClone(raw), drafts: structuredClone(draftsIn), repairs: [], discarded: false };', "if (!repairKeys.length) { const again = structuredClone(raw); again.trace = [...(again.trace ?? []), { type: 'saved_state_repaired' }]; return { state: again, drafts: structuredClone(draftsIn), repairs: [], discarded: false }; }")] },
  { id: 'E3', required: null, description: 'repair silently drops all but the first valid queue entry',
    edits: [edit('recovery.js', "queue = dedupe(queue, 'queue', counts);", "queue = dedupe(queue, 'queue', counts).slice(0, 1);")] },
  { id: 'E4', required: null, description: 'repair can throw on a hostile record (safety net removed)',
    edits: [edit('recovery.js', "} catch {\n    return fresh('record_unreadable');\n  }", '} catch (error) {\n    throw error;\n  }')] },
  { id: 'E5', required: null, description: 'repair does not cap an oversized queue',
    edits: [edit('recovery.js', 'if (queue.length > LIMITS.queue) {', 'if (false) {')] },
  { id: 'E6', required: null, description: 'repair does not cap an oversized trace',
    edits: [edit('recovery.js', 'if (trace.length > LIMITS.trace) {', 'if (false) {')] },
  { id: 'E7', required: null, description: 'repair drops saved drafts',
    edits: [edit('recovery.js', "if (isId(itemId) && isObject(draft) && typeof draft.optionId === 'string'", "if (false && isId(itemId) && isObject(draft) && typeof draft.optionId === 'string'")] },
  { id: 'F1', required: null, description: 'memory storage hands out the stored object itself instead of a copy',
    edits: [edit('storage.js', 'async load() { return record ? structuredClone(record) : null; },', 'async load() { return record ? record : null; },')] },
  { id: 'F2', required: null, description: 'a rejected durable write overwrites the older durable record with an empty one',
    edits: [edit('storage.js', "} catch (error) { fallbackMode = true; lastError = reasonOf(error); await fallback.save(value); }", "} catch (error) { fallbackMode = true; lastError = reasonOf(error); await fallback.save(value); try { const db = await openDb(); db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(RECORD_KEY); } catch { /* ignored */ } }")] },
  { id: 'G1', required: 'a', description: 'malformed clock is parsed without validation, allowing retry fields to mutate before timestamp failure',
    edits: [edit('retry.js', 'const nowMs = parseRetryTimestamp(nowIso);', 'const nowMs = Date.parse(nowIso);')] }
]);

export function applyEdits(files, edits) {
  const out = { ...files };
  for (const { file, find, replace } of edits) {
    if (!(file in out)) throw new Error(`mutation target ${file} is not in the copied source`);
    const count = out[file].split(find).length - 1;
    if (count !== 1) throw new Error(`mutation text for ${file} must occur exactly once, found ${count}: ${find.slice(0, 70)}`);
    out[file] = out[file].replace(find, () => replace);
  }
  return out;
}
