# PR #512: HF E2E migration preview

- [HF dashboard](e2e-accuracy/) · [DB baseline](db-baseline/) · [Comparison report](comparison.json) · [Input audit](input-comparison.json).
- [Fresh campaign](https://github.com/ai-dynamo/aisimulate/actions/runs/39335708203) passed all four shards and qualification on `30b264ae91bf5a4fdad1ab75d3a85114f2e09094`.
- Full CI passed for [#512](https://github.com/ai-dynamo/aisimulate/actions/runs/39335694165) and [#513](https://github.com/ai-dynamo/aisimulate/actions/runs/39335666300) at their current heads.
- All 1,321 matched successful AISim STP predictions agree exactly across TTFT, TPOT, E2E latency and both throughput metrics. All 1,052 matched successful AIC predictions agree across available metrics. This includes the previously differing 35 MiniMax cases.
- All 1,754 unambiguous shared published points retain the same measurements, configurations and prediction statuses. One ambiguous matching key is excluded.
- HF selects 1,974 STP + 881 MTP inputs. It publishes 1,773 STP points (1,340 successful, 433 failed) and 197 MTP points (194 successful, 3 failed). Source resolution excludes 201 STP + 684 MTP points. Missing/shared observed acceptance remains unresolved; no values are fitted to measured latency.
- The DB baseline is STP-only. MTP results demonstrate fresh evaluation, not DB/HF numerical parity. The cohorts differ, so aggregate MAPE changes are not predictor regression evidence.

## Reproduce and provenance

- Run `python3 pr-512/compare.py` to verify qualification hashes and regenerate the comparison from the public summaries.
- DB baseline: [run 39237616407](https://github.com/ai-dynamo/aisimulate/actions/runs/39237616407), commit `c9e7363bf5983b980fe6622f7b064ee7adff5f5d`.
- HF UI: `pages/e2e-accuracy/{index.html,styles.css,app.js}` at `30b264ae91bf5a4fdad1ab75d3a85114f2e09094`. DB UI retains the baseline commit's files.
- Predictor source under `python/aisimulate/src` and `crates` is unchanged between those commits. Wheels have distinct hashes; this is a same-source comparison, not a byte-identical-wheel comparison.
- HF revision: `8ec77d043d236ae92aa0cee6a9896f8195ea7718`; DB release: `db-dump/2026-09-28`. Measurement attribution: SemiAnalysis InferenceX.
- The input audit records pinned table hashes, selection/exclusion counts, cohort overlap and complete deployment equality for all 124 affected STP cases (93 resolved, 31 equally unresolved).
- Summary and qualification bytes are copied unchanged from CI. Only qualified public payloads and aggregate evidence are published; private cache rows, logs, encrypted artifacts and tokens are excluded.
- Dashboard files retain NVIDIA copyright and Apache-2.0 notices; root LICENSE and THIRD_PARTY_NOTICES.md are preserved.

## Browser validation

- Chromium passed on the unmodified qualified payload: real MTP filtering, totals after reload, three detail charts, keyboard point-dialog activation with depth/acceptance labels, and mobile overflow checks. No JavaScript errors.

## Summary hashes

- HF: SHA-256 `3edfa0c0ee23935cf097ee75e55766a0f64c72102c3a789b51a942e4f13456ee`.
- DB: SHA-256 `0b4abf753ba7f41273aebda68d02028200cfe8c7360187ff6ff106ebc6f52e2d`.
