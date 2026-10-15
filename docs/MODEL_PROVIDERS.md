# Gemini and Groq model configuration

**Current product choice:** the requested hosted providers are Gemini and Groq; Ollama is not part of the runbook or sample configuration. The provider library retains an older adapter because historical fake-server evidence/tests use it, but this build must be launched with `PATHASETU_MODEL_PROVIDERS=gemini,groq` (or one selected hosted provider). No Ollama call is required or made by the commands below.

## Evidence levels

| Level | Current evidence |
|---|---|
| Implemented | Gemini and Groq adapters, configuration validation, output validation, fallback ordering, and optional planning. |
| Unit-tested | Adapter request/response handling, schema validation, timeout behavior, and failure handling with fake responses. |
| Integration-tested | Fake local provider servers only; this is not a live provider test. |
| Browser-tested | Earlier stubbed/mock paths only; no current live-provider browser flow. |
| Run against a real Ollama, Gemini or Groq model | Not run in this review. |
| Run on a physical phone | Not run. |
| Content reviewed by a qualified teacher | Not reviewed; the shipped pack remains a draft. |

## What the app actually does

- `src/server/modelEnv.js` validates an ordered provider list and requires an explicit model name and key for each hosted service. It does not select a model name for you.
- `src/server/modelConfig.js` builds the configured chain. The main `/api/recheck` route is the only hosted-model learner-response route currently retained.
- The chain may propose an allowed diagnosis and next question. The application validates model output; invalid output is rejected, not silently substituted with a confident answer. Confidence below the configured floor becomes `UNCERTAIN`.
- `npm run generate:drafts` creates files marked `UNREVIEWED_DRAFT`; generated material does not enter the learner content pack automatically.
- The old `/api/ai-live` endpoint for free-form tutoring/generation was removed. It bypassed this provider configuration and its protective route behavior.
- Optional Firebase guardian sign-in and manual UID-scoped progress sync are implemented in source, but remain disabled until the Web App config and Google provider are configured. Firestore Rules are not deployed and live sync has not been verified. Learner explanations are sent to the configured hosted provider during an online re-check. Use synthetic text only until privacy and provider data handling are approved.

## Configure locally

Run from the repository root in a private terminal. The following commands prompt for keys without echoing them; do not paste key values in chat or commit them. Choose exact model IDs supported by the two accounts and verify them against current provider documentation/account access.

```zsh
read -s "GEMINI_API_KEY?Gemini API key (hidden): "; export GEMINI_API_KEY; printf '\n'
read -r "GEMINI_MODEL?Gemini model ID: "; export GEMINI_MODEL
read -s "GROQ_API_KEY?Groq API key (hidden): "; export GROQ_API_KEY; printf '\n'
read -r "GROQ_MODEL?Groq model ID: "; export GROQ_MODEL
export PATHASETU_MODEL_PROVIDERS=gemini,groq
export PATHASETU_PROVIDER_DATA_CONTROLS_ACK=true
export PATHASETU_DEMO_ACCESS_CODE="$(node -e "process.stdout.write(require('node:crypto').randomBytes(24).toString('base64url'))")"
npm run preflight
npm start
```

The model list order is the fallback order. The example places Gemini first because it is named first in the requested stack; confirm that preference before a real learner pilot. Keys above exist only in that terminal environment. A terminal recording, shell trace, or shared machine may still expose environment state; use a secrets manager for deployment. The access code is private-demo gating, not user authentication.

## Configuration variables

The server reads `PATHASETU_MODEL_PROVIDERS`, `PATHASETU_MODEL_PROVIDER`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GROQ_API_KEY`, `GROQ_MODEL`, `PATHASETU_MODEL_TIMEOUT_MS`, `PATHASETU_MODEL_DEADLINE_MS`, `PATHASETU_MODEL_PLANNING`, `PATHASETU_RETRY_MAX_ATTEMPTS`, `PATHASETU_RETRY_BASE_DELAY_MS`, `PATHASETU_RETRY_FACTOR`, and `PATHASETU_RETRY_MAX_DELAY_MS`. See `.env.example` for safe defaults and sample values. `OLLAMA_URL` and `OLLAMA_MODEL` belong to the legacy adapter; they are documented only to make that adapter's existing configuration explicit. The requested product run does not enable or call Ollama.

## Provider acceptance criteria before pilot

Use synthetic examples only. For each provider separately, record model ID, timestamp, request outcome, latency, timeout/rate-limit behavior, valid JSON rate, validator acceptance, Odia quality review, and estimated cost. Force one provider failure and confirm the fallback is visible and safe. Do not call model output accurate, curriculum-grounded, or pedagogically validated based on a successful API response.

The earlier Iteration 15 evidence used fake providers and included an Ollama test server. Those tests verify older adapter plumbing only. They are not evidence that Gemini or Groq was reached, that Odia works, or that model output is correct.

None of this has been run against a real model in the current verification pass. Unit and fake-provider tests establish code behavior only; they do not establish provider availability, output quality, curriculum alignment, privacy suitability, or learner outcomes.
