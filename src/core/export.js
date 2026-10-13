// Builds the downloadable trace export. Pure and browser-safe.
// The export is demo evidence: it never includes the learner's typed explanations, drafts, access codes or environment values.
const PATTERNS = [
  /gsk_[A-Za-z0-9]{16,}/g,
  /\bsk-[A-Za-z0-9_-]{16,}/g,
  /Bearer\s+[A-Za-z0-9._~+/-]{12,}=*/gi,
  /\b(?:GROQ_API_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY|PATHASETU_DEMO_ACCESS_CODE)\b\s*[=:]\s*["']?[^\s"',}]+/gi,
  /x-pathasetu-demo-code["']?\s*[:=]\s*["']?[^\s"',}]+/gi
];

export function redactSecrets(text, knownSecrets = []) {
  let redactions = 0;
  let out = String(text);
  for (const secret of knownSecrets) {
    if (typeof secret !== 'string' || secret.length < 8) continue;
    const parts = out.split(secret);
    if (parts.length > 1) { redactions += parts.length - 1; out = parts.join('[REDACTED]'); }
  }
  for (const pattern of PATTERNS) out = out.replace(pattern, () => { redactions += 1; return '[REDACTED]'; });
  return { text: out, redactions };
}

export function buildTraceExport({ state, provider, model, storage = {}, persistence = null, exportedAt = new Date().toISOString(), knownSecrets = [] }) {
  const answers = (state?.answers ?? []).map(({ explanation, ...rest }) => ({ ...rest, explanation: { redacted: true, characters: typeof explanation === 'string' ? explanation.length : 0 } }));
  const payload = {
    product: 'Pathasetu', exportFormat: 2, exportedAt, provider: provider ?? null, model: model ?? null,
    contentStatus: 'UNREVIEWED_DRAFT',
    note: 'Demo evidence only. Typed explanations, drafts, access codes and environment values are not included.',
    storage: { mode: storage.mode ?? null, persistent: storage.persistent ?? null, lastError: storage.lastError ?? null, persistence },
    counts: { answers: answers.length, queue: state?.queue?.length ?? 0, trace: state?.trace?.length ?? 0 },
    state: state ? { schemaVersion: state.schemaVersion, learner: state.learner, answers, queue: state.queue, trace: state.trace, lastUpdated: state.lastUpdated } : null
  };
  const redacted = redactSecrets(JSON.stringify(payload, null, 2), knownSecrets);
  return { json: redacted.text, redactions: redacted.redactions, counts: payload.counts };
}
