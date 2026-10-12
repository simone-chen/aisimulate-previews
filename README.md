# AISimulate review previews

- [PR #417](https://github.com/ai-dynamo/aisimulate/pull/417): [FPM Gym preview](https://simone-chen.github.io/aisimulate-previews/pr-417/fpm-accuracy/?branch=main).
- Dashboard and evaluator source: `ai-dynamo/aisimulate` at `714e0188d1921ad90485670efa674cebc011011f` (Apache-2.0).
- [Qualified evaluation](https://github.com/ai-dynamo/aisimulate/actions/runs/38318468113), attempt 1, October 12, 2026 UTC. Predictor wheel: `2f0f4cd8606d580567b253d02f3d699fe36db865`. [HF PR #16 revision](https://huggingface.co/datasets/nvidia/aisimulate-fpm-dataset/tree/562d958065e7695e6811561d3c78c1f648c70d3b): `562d958065e7695e6811561d3c78c1f648c70d3b`.
- Measurement and evaluation artifact qualification, checksums, and 3D/evaluation membership checks passed for all 29 current configurations. The 3D bundle contains 302 assets.
- Compared with the prior preview, all configuration measurement counts, predictor counts, error counts, and statuses are unchanged. Regression MAPE varies between runs; warmup-on MAPE also changed slightly for GLM GB200 DEP16 (overall 5.261884% to 5.262197%). The predictor source advanced, so this is an integration rerun, not an isolated score-equivalence experiment. See the [comparison](pr-417/fpm-accuracy/integration-scoring-comparison.json).
- Chromium checks passed for 16 contributing chart runs across seven configurations, collection selection and URL persistence, missing-evidence banners, historical evaluations, all five tabs, and both 3D panels. Desktop/mobile layouts (1440/390px) were checked in both themes with no JavaScript errors or horizontal overflow.
- Related validation: evaluator/Pages tests 367 passed, 20 native SDK tests skipped, 138 subtests passed; workflow tests 11 passed; dashboard fixture browser checks passed.
- Details uses compact request charts and grouped Dataset, Workload, and Collection metadata. Overview summaries display distinct concurrency settings as plain grey text. Configuration links retain pinned Hugging Face evidence.
- Historical evaluation files retain their original data. Request charts remain unavailable where matching request exports were disabled or not recovered; no measurements are invented.
- Built with `scripts/pages/build_pages_site.py` from qualified Actions artifacts. This is a manually published review snapshot and does not automatically follow PR pushes. Neither PR has been merged; production Pages and HF main are unchanged.
- Original copyright, license, and attribution notices are preserved in `LICENSE`, `THIRD_PARTY_NOTICES.md`, and copied assets.
