# AISimulate review previews

- [PR #417](https://github.com/ai-dynamo/aisimulate/pull/417): [FPM Gym preview](https://simone-chen.github.io/aisimulate-previews/pr-417/fpm-accuracy/?branch=main).
- Dashboard source: `ai-dynamo/aisimulate` at `9cdd2cf698b2c2143625e14758f6234402eaea44` (Apache-2.0).
- Collection summaries show distinct recorded concurrency settings; Details uses a Concurrency setting selector. Only the current snapshot summary gains display metadata derived from its pinned detail artifact. Scores, request charts, evaluation identity, and historical files are unchanged. Validation: 358 tests passed, 20 skipped, 138 subtests passed, plus browser checks.
- Configuration evidence links display the Hugging Face emoji followed by Configuration.
- Collection summaries omit the Test set prefix and Unknown labels while retaining known collection information and Details links.
- Details uses compact 12–14px section text and availability banners, and organizes metadata into Dataset, Workload, and Collection with aligned label/value rows and a separate profiling summary. Verified desktop/mobile layouts in both themes.
- Request charts use compact, left-aligned cards: two columns within 1,000px on desktop, one column on mobile. Checked both themes with all 16 contributing chart runs; evaluation data is unchanged.
- Qualified evaluation and complete 3D assets: Actions run `37988272681`, attempt `1`, October 9, 2026 UTC. AISim source `e45612e18376c6aef28fb697f3131602613354f4`; HF revision `ae9f4acc077f69b0a12bd7a558e3a6e4bf48550b`.
- Details now shows all four request charts for 16 contributing runs across seven configurations, including recovered DeepSeek Pro B200/B300, GLM B200/GB200, and MiniMax B200 captures, plus Kimi. Mobile/desktop layouts, both themes, run URLs, availability banners, all five tabs and historical links were checked in Chromium.
- The HF dataset contains 24 request-metric runs. Four historical E9 runs and four current runs without accepted measurement membership do not contribute to this evaluation. Collection metadata remains limited to evaluated truth.
- Missing request charts now distinguish disabled H200 exports from unrecovered GB300 source directories. Historical evaluations retain their original metadata.
- Built with `scripts/pages/build_pages_site.py` after qualification/checksum checks. Historical evaluations remain unchanged from Pages artifact run `37659580012`.
- Both FPM variants preserve all scores and counts. Existing randomized regression retention causes independent-run MAPE variation, recorded in [this rerun comparison](pr-417/fpm-accuracy/recovery-scoring-comparison.json).
- This is a manually published review snapshot. Production Pages and HF main are unchanged; the preview does not automatically follow PR pushes.
- Original copyright, license, and attribution notices are preserved in `LICENSE`, `THIRD_PARTY_NOTICES.md`, and copied assets.
