// Hotfix 1 to Iteration 15. A child process started by a test must not inherit provider, model, access-code or server variables
// from the terminal that ran `npm test`. This builds the environment for such a child: the inherited one without those variables, plus the overrides.
export const SCRUBBED_NAMES = ['GROQ_API_KEY', 'GROQ_MODEL', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'OLLAMA_URL', 'OLLAMA_MODEL', 'HOST', 'PORT', 'NODE_ENV'];
const isScrubbed = (name) => name.startsWith('PATHASETU_') || SCRUBBED_NAMES.includes(name);

export function cleanEnv(overrides = {}, base = process.env) {
  const env = {};
  for (const [name, value] of Object.entries(base)) if (!isScrubbed(name)) env[name] = value;
  return { ...env, ...overrides };
}
