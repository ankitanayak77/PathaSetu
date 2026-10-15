// Iteration 15: ask the configured model chain to DRAFT new multiple-choice questions for a concept already in the pack.
// Output goes to a file outside src/, public/, content/ and scripts/, is marked AI generated and UNREVIEWED_DRAFT, and is never
// loaded by the app. A qualified teacher must review every item before it could be copied into the content pack by hand.
//   node scripts/generate-draft-items.mjs --concept <conceptId> [--count 3] [--out generated-drafts/<name>.json] [--dry-run]
// Provider selection uses the same environment variables as the server (PATHASETU_MODEL_PROVIDERS, OLLAMA_MODEL, GEMINI_*, GROQ_*).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPack } from '../src/core/content.js';
import { parseModelConfig } from '../src/server/modelConfig.js';
import { buildGenerationRequest, validateGeneratedItem } from '../src/server/providers.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORBIDDEN = ['content', 'public', 'src', 'scripts'].map((d) => path.join(ROOT, d) + path.sep);

function option(argv, name) {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
}

export async function runGeneration({ argv, env = process.env, fetchImpl = globalThis.fetch, now = () => new Date().toISOString() }) {
  const conceptId = option(argv, '--concept');
  if (!conceptId) throw new Error('--concept <conceptId> is required');
  const count = option(argv, '--count') === undefined ? 3 : Number(option(argv, '--count'));
  if (!Number.isInteger(count) || count < 1 || count > 10) throw new Error('--count must be a whole number from 1 to 10');
  if (!env.PATHASETU_MODEL_PROVIDERS) throw new Error('Set PATHASETU_MODEL_PROVIDERS (for example ollama) and that provider\'s model variables first');
  const pack = loadPack();
  const request = buildGenerationRequest({ pack, conceptId, count }); // throws unknown_concept
  if (argv.includes('--dry-run')) return { dryRun: true, request };
  const out = path.resolve(ROOT, option(argv, '--out') ?? path.join('generated-drafts', `${conceptId}-${now().replace(/[:.]/g, '-')}.json`));
  if (FORBIDDEN.some((dir) => (out + path.sep).startsWith(dir))) throw new Error('--out must be outside content/, public/, src/ and scripts/ so a draft can never be loaded by the app');
  const config = parseModelConfig(env, { fetchImpl });
  if (!config.chain) throw new Error('PATHASETU_MODEL_PROVIDERS must name at least one provider');
  const generated = await config.chain.generate({ pack, conceptId, count });
  const taken = new Set(pack.items.map((item) => item.id));
  const accepted = []; const rejected = [];
  for (const raw of generated.items.slice(0, count)) {
    const checked = validateGeneratedItem(raw, { provider: generated.provider, model: generated.model, at: now() }, taken);
    if (checked.ok) { accepted.push(checked.item); taken.add(checked.item.id); }
    else rejected.push({ id: typeof raw?.id === 'string' ? raw.id.slice(0, 40) : null, errors: checked.errors.slice(0, 10) });
  }
  if (!accepted.length) throw new Error(`The model returned no valid items (${rejected.length} rejected). Nothing was written.`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify({ notice: 'AI-generated draft questions. They have not been reviewed by a teacher and must not be shown to learners until they are.', generatedAt: now(), conceptId, provider: generated.provider, model: generated.model, fallbacks: generated.attempts.map(({ provider, code }) => ({ provider, code })), items: accepted, rejected }, null, 2)}\n`);
  return { accepted: accepted.length, rejected: rejected.length, out };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runGeneration({ argv: process.argv.slice(2) }).then((result) => {
    if (result.dryRun) console.log(JSON.stringify(result.request, null, 2));
    else console.log(`Wrote ${result.accepted} unreviewed draft item(s) to ${path.relative(process.cwd(), result.out)}; ${result.rejected} rejected.`);
  }).catch((error) => { console.error(`generate-draft-items: ${error.message}`); process.exit(1); });
}
