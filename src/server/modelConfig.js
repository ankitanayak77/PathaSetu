// Iteration 15: builds the provider chain from the validated environment (see ./modelEnv.js for every rule).
import { createOllamaClient, createGeminiClient, createGroqClient, createProviderChain } from './providers.js';
import { parseModelEnv } from './modelEnv.js';

export function parseModelConfig(env = process.env, { fetchImpl = globalThis.fetch } = {}) {
  const parsed = parseModelEnv(env);
  if (parsed.mode !== 'chain') return { mode: parsed.mode, chain: null, needsAccessCode: parsed.needsAccessCode, planning: false, timings: null, recheckTimeoutMs: parsed.recheckTimeoutMs, retryPolicy: parsed.retryPolicy, retryPolicySource: parsed.retryPolicySource };
  const { perProviderTimeoutMs, deadlineMs } = parsed.timings;
  const clients = parsed.providers.map((spec) => {
    if (spec.name === 'ollama') return createOllamaClient({ baseUrl: spec.baseUrl, model: spec.model, timeoutMs: perProviderTimeoutMs, fetchImpl });
    if (spec.name === 'gemini') return createGeminiClient({ apiKey: spec.apiKey, model: spec.model, timeoutMs: perProviderTimeoutMs, fetchImpl });
    return createGroqClient({ apiKey: spec.apiKey, model: spec.model, timeoutMs: perProviderTimeoutMs, fetchImpl });
  });
  return { mode: 'chain', chain: createProviderChain(clients, parsed.timings), needsAccessCode: parsed.needsAccessCode, planning: parsed.planning, timings: parsed.timings, recheckTimeoutMs: parsed.recheckTimeoutMs, retryPolicy: parsed.retryPolicy, retryPolicySource: parsed.retryPolicySource };
}
