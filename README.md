# AISimulate review previews

- Open previews through their hosted HTTPS URLs. The index uses absolute links so opening a local checkout's `index.html` also navigates to GitHub Pages; dashboard data cannot load directly from local files.

## AgentX ad-hoc preview (2026-11-23)

- [AgentX tab](https://simone-chen.github.io/aisimulate-previews/agentx-adhoc-20261123/e2e-accuracy/?tab=agentx&throughput=output&view=interactivity&branch=main) has four entries: GLM-5.3 NVFP4 (SGLang 0.5.20, official AgentX points) and Qwen3.5-397B (vLLM 0.31.0, 6 self-collected lanes), each with **Op-based + CPU overhead** and **Learned FPM + CPU overhead**.
- CPU overhead modeling (`engine.tokenization` and `engine.extra_cpu_overhead`) comes from unmerged ai-dynamo/aisim#930 and #932 plus held wiring.
  - Qwen: 1.436 µs/token tokenization, plus 29.5 ms and 0.245 µs/token of extra overhead. The extra term was fitted on lanes 1 and 4.
  - GLM: SGLang 0.5.21 tokenizer only, 1.217 µs/token. No fixed SGLang overhead has been measured, so none is applied.
- Learned FPM uses frozen GBDT artifacts trained on our step captures.
  - Qwen: pooled seeds.
  - GLM: MTP-on, SGLang 0.5.20.
  - The learned-plus-MTP replay gate is relaxed locally.
- Replayed locally from origin/main 5ef2532eb plus these patches. Silicon dataset revision: 37cdb0319a7e. The Overview tab is a copy of the live main snapshot.
- Metrics, from the dashboard spec: step error (prefill and decode MAPE ± std/√n on held-out seed-7 step captures, per lane; learned = seed-42 model; GLM drops 2,987 steps whose time SGLang 0.5.20 recorded on the adjacent record). Then TPOT and TTFT e2e error (request-average) and per-request quantile error (p5–p95). Those are unsigned, closed-loop, over matched requests, as mean ± bootstrap stderr (1,000 resamples). Silicon TPOT under 1 ms is excluded, and the count is shown. Per-request MAPE was dropped, and anchored per-request error isn't run.
- This is a manually published review snapshot. It is not the production Gym.

## PR #686: AgentX comparison dashboard

- [AgentX preview](https://simone-chen.github.io/aisimulate-previews/pr-686/e2e-accuracy/?tab=agentx&branch=simonec%2Fagentx-opdata-preview): one expanded table, integrated silicon comparisons, paired request timelines, and system/manual themes.
- Latest qualified data: six GLM points and 36 finite Qwen runs, using pinned op-data changes from #664/#665/#666 on a separate integration branch. All 42 HF feature inventories are included. The Qwen Weka pilot passes corrected functional qualification after CPU investigation of normal cutoff cancellation. The resumed collection qualified lanes 1 and 4, then stopped when the 8-lane server exceeded its checkpoint-loading deadline. These partial results remain private; all six profiles and the complete replacement campaign are required before changing these scores.
- Publication checks validated checksums, complete accounting, consistent provenance, and the public field allowlist before upload. Private inputs, prompts, token arrays, raw stream events, local paths, and logs are excluded.
- [Provenance and validation](pr-686/README.md). This review snapshot is separate from production rollout, which awaits reviewed dataset promotion and the op-data dependencies landing.

## PR #417: FPM Gym

- [PR #417](https://github.com/ai-dynamo/aisimulate/pull/417): [FPM Gym preview](https://simone-chen.github.io/aisimulate-previews/pr-417/fpm-accuracy/?branch=main).
- Dashboard source: `ai-dynamo/aisimulate` at `0c5bb9ecfc46ca96feb9a88da70fc493c75dc164` (Apache-2.0). Evaluation remains pinned to `714e0188d1921ad90485670efa674cebc011011f`.
- [Qualified evaluation](https://github.com/ai-dynamo/aisimulate/actions/runs/38318468113), attempt 1, October 12, 2026 UTC. Predictor wheel: `2f0f4cd8606d580567b253d02f3d699fe36db865`. [HF PR #16 revision](https://huggingface.co/datasets/nvidia/aisimulate-fpm-dataset/tree/562d958065e7695e6811561d3c78c1f648c70d3b): `562d958065e7695e6811561d3c78c1f648c70d3b`.
- Measurement and evaluation artifact qualification, checksums, and 3D/evaluation membership checks passed for all 29 current configurations. The 3D bundle contains 302 assets.
- Compared with the prior preview, all configuration measurement counts, predictor counts, error counts, and statuses are unchanged. Regression MAPE varies between runs; warmup-on MAPE also changed slightly for GLM GB200 DEP16 (overall 5.261884% to 5.262197%). The predictor source advanced, so this is an integration rerun, not an isolated score-equivalence experiment. See the [comparison](pr-417/fpm-accuracy/integration-scoring-comparison.json).
- Chromium checks passed for 16 contributing chart runs across seven configurations, collection selection and URL persistence, missing-evidence banners, historical evaluations, all five tabs, and both 3D panels. Desktop/mobile layouts (1440/390px) were checked in both themes with no JavaScript errors or horizontal overflow.
- Related validation: evaluator/Pages tests 367 passed, 20 native SDK tests skipped, 138 subtests passed; workflow tests 11 passed; dashboard fixture browser checks passed.
- Serving columns on Overview and Predictors show values only on parallelism/configuration rows; model rows stay blank. Multiple values use commas, e.g. Agg*, Disagg, with Agg* for unknown metadata and an explanatory footnote. Explicit not-applicable remains N/A. Layout summaries are derived only from the matching pinned Details artifacts; historical artifacts and scores are unchanged. Browser checks cover both tabs, mixed layouts, defaults, legacy names, and sorting.
- Details uses compact request charts and grouped Dataset, Workload, and Collection metadata. Overview summaries display distinct concurrency settings as plain grey text. Configuration links retain pinned Hugging Face evidence.
- Historical evaluation files retain their original data. Request charts remain unavailable where matching request exports were disabled or not recovered; no measurements are invented.
- Built with `scripts/pages/build_pages_site.py` from qualified Actions artifacts. This is a manually published review snapshot and does not automatically follow PR pushes. Neither PR has been merged; production Pages and HF main are unchanged.
- Original copyright, license, and attribution notices are preserved in `LICENSE`, `THIRD_PARTY_NOTICES.md`, and copied assets.

## PR #512: E2E HF input migration

- [Preview and comparison](https://simone-chen.github.io/aisimulate-previews/pr-512/): HF-backed E2E Gym plus the DB baseline.
- [Pipeline](https://github.com/ai-dynamo/aisimulate/actions/runs/39306484930) passed all four prediction shards and final qualification at `6215ed1a8859608c760d6866b9d237c7cf34aa03`.
- Numerical parity is not achieved: the cohort differs, and DB-ID bindings affect reviewed runtime/launcher evidence. Of 1,296 matched successful replay points, 35 differ; all are MiniMax-M2.5 NVFP4 on B300 with Dynamo-vLLM.
- [Provenance and validation](pr-512/README.md). This isolated preview preserves the existing PR #417 deployment and does not update production Pages.
