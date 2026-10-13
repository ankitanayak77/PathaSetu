// Markdown report for one evaluation run (and an optional side-by-side with the deterministic baseline).
const pct = (x) => (x === null || x === undefined ? 'n/a' : `${(x * 100).toFixed(0)}%`);
const frac = (r) => `${r.successes}/${r.n} (${pct(r.rate)}, 95% CI ${pct(r.low)} to ${pct(r.high)})`;
const ms = (v) => (v === null || v === undefined ? 'n/a' : `${Math.round(v)} ms`);

export function renderReport({ meta, metrics, baseline = null }) {
  const m = metrics; const d = m.diagnosis; const c = m.compatibility;
  const lines = [];
  lines.push(`# Diagnosis evaluation: ${meta.label}`, '');
  lines.push(`**Dataset status: TEAM_AUTHORED_UNVALIDATED.** ${meta.datasetWarning}`, '');
  lines.push(`Run: ${meta.when} · provider: ${meta.provider}${meta.model ? ` · model: ${meta.model}` : ''} · cases: ${m.limits.n} · languages: ${m.limits.languages.join(', ')} · Odia script and Roman Odia: **NOT EVALUATED**.`, '');
  lines.push('Reference class counts: ' + Object.entries(m.limits.referenceClassCounts).map(([k, v]) => `${k} ${v}`).join(', ') + '.', '');
  lines.push('## A. API and schema compatibility (independent of the reference labels)', '');
  lines.push('| Measure | Result |', '| --- | --- |');
  lines.push(`| Structurally valid and accepted by the validator | ${frac(c.validRate)} |`, `| Rejected by the validator | ${c.rejectedByValidator} |`, `| Request errors | ${c.errors} (timeouts ${c.timeouts})${Object.keys(c.errorCodes).length ? ` · codes ${JSON.stringify(c.errorCodes)}` : ''} |`, `| Latency p50 / p95 | ${ms(c.latencyMs.p50)} / ${ms(c.latencyMs.p95)} |`, '');
  lines.push('A high value here means the request shape and response format work. It says nothing about whether the diagnoses are right.', '');
  lines.push('## B. Agreement with the unvalidated reference labels', '');
  lines.push('| Measure | Result |', '| --- | --- |');
  lines.push(`| Agreement over all cases (errors and rejections count as disagreement) | ${frac(d.overallAgreementOverAllCases)} |`, `| Agreement over valid outputs only | ${frac(d.overallAgreementOverValidOnly)} |`);
  for (const [cat, r] of Object.entries(d.byCategory)) lines.push(`| · ${cat.replaceAll('_', ' ')} | ${frac(r)} |`);
  lines.push(`| False-positive misconceptions on correct reasoning | ${frac(d.falsePositiveMisconceptionsOnCorrectReasoning)} |`);
  const mc = d.misconceptionCases;
  lines.push(`| Misconception cases: detected / with the reference id / another id / missed as NONE / abstained | ${mc.detectedAsAMisconception} / ${mc.withTheReferenceId} / ${mc.withAnotherId} / ${mc.missedAsNone} / ${mc.abstained} of ${mc.n} |`);
  lines.push(`| "Right answer, wrong reason" cases agreed | ${mc.rightAnswerWrongReason.agreed}/${mc.rightAnswerWrongReason.n} |`);
  lines.push(`| Abstention overall | ${frac(d.abstention.overall)} |`, `| Over-abstention on answerable cases | ${frac(d.abstention.onAnswerableCases_overAbstention)} |`, `| Proper abstention on ambiguous or insufficient cases | ${frac(d.abstention.onAbstainReferenceCases_properAbstention)} |`, `| False confidence on ambiguous or insufficient cases | ${frac(d.abstention.onAbstainReferenceCases_falseConfidence)} |`, '');
  lines.push('| Reference \\ predicted | MISCONCEPTION | NONE | UNCERTAIN | not valid |', '| --- | --- | --- | --- | --- |');
  for (const ref of ['MISCONCEPTION', 'NONE', 'UNCERTAIN']) lines.push(`| ${ref} | ${d.confusion[ref].MISCONCEPTION} | ${d.confusion[ref].NONE} | ${d.confusion[ref].UNCERTAIN} | ${d.confusion[ref].NOT_VALID} |`);
  lines.push('', 'Per-type precision and recall: ' + Object.entries(d.perClass).map(([k, v]) => `${k} P=${pct(v.precision)} R=${pct(v.recall)} (${v.reference} reference cases)`).join('; ') + '.', '');
  const reported = Object.entries(d.perMisconception);
  const skipped = Object.entries(d.perMisconceptionNotReported);
  lines.push(reported.length ? 'Per-misconception precision and recall: ' + reported.map(([k, v]) => `${k} P=${pct(v.precision)} R=${pct(v.recall)} (n=${v.referenceCases})`).join('; ') + '.' : 'Per-misconception precision and recall: **not reported**; no misconception has 3 or more reference cases.', '');
  if (skipped.length) lines.push(`Not reported because they have fewer than 3 reference cases each: ${skipped.map(([k, v]) => `${k} (n=${v.referenceCases})`).join(', ')}.`, '');
  lines.push('Prompt-injection probe: ' + (d.injectionProbes.length ? d.injectionProbes.map((p) => `${p.id} → ${p.predicted ? `${p.predicted.type}${p.predicted.misconceptionId ? `:${p.predicted.misconceptionId}` : ''}` : p.outcome}${p.followedTheInjectedInstruction ? ' (FOLLOWED THE INSTRUCTION)' : ' (did not follow it)'}`).join('; ') : 'none') + '.', '');
  lines.push('### Notable failures', '');
  lines.push(d.notableFailures.length ? '| Case | Item | Category / variant | Reference | System result |\n| --- | --- | --- | --- | --- |\n' + d.notableFailures.map((f) => `| ${f.id} | ${f.itemId} | ${f.category.replaceAll('_', ' ')} / ${f.variant} | ${f.reference} | ${f.result} |`).join('\n') : 'None.', '');
  if (baseline) {
    const b = baseline.diagnosis; const bc = baseline.compatibility;
    lines.push('## C. Comparison with the deterministic baseline on the identical cases', '');
    lines.push('| Measure | This run | Deterministic baseline |', '| --- | --- | --- |');
    lines.push(`| Valid outputs | ${frac(c.validRate)} | ${frac(bc.validRate)} |`, `| Agreement over all cases | ${frac(d.overallAgreementOverAllCases)} | ${frac(b.overallAgreementOverAllCases)} |`, `| False-positive misconceptions on correct reasoning | ${frac(d.falsePositiveMisconceptionsOnCorrectReasoning)} | ${frac(b.falsePositiveMisconceptionsOnCorrectReasoning)} |`, `| Proper abstention on ambiguous or insufficient | ${frac(d.abstention.onAbstainReferenceCases_properAbstention)} | ${frac(b.abstention.onAbstainReferenceCases_properAbstention)} |`, `| Over-abstention on answerable cases | ${frac(d.abstention.onAnswerableCases_overAbstention)} | ${frac(b.abstention.onAnswerableCases_overAbstention)} |`, '');
  }
  lines.push('## Limits', '', ...m.limits.statements.map((s) => `- ${s}`), '- This is an engineering check of behaviour on team-written examples. It is not a validated benchmark, not evidence of Odia understanding, and not evidence of learning impact.', '');
  return lines.join('\n');
}
