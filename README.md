# AISimulate review previews

- [PR #417](https://github.com/ai-dynamo/aisimulate/pull/417): [FPM Gym preview](https://simone-chen.github.io/aisimulate-previews/pr-417/fpm-accuracy/?branch=main).
- Dashboard source: `ai-dynamo/aisimulate` at `edef772674dbbaf19668be942cce3ed95163b95e` (Apache-2.0).
- Qualified evaluation and complete 3D assets: Actions run `37880548507`, attempt `1`, October 9, 2026 UTC. AISim source `e45612e18376c6aef28fb697f3131602613354f4`; HF revision `f0b06f11a2ebdf298e6eb1eec37a2acb7c30b231`.
- Kimi K3 Details includes verified per-run request charts and workload settings. Other runs display their recorded availability; old evaluations retain their original metadata.
- Built with `scripts/pages/build_pages_site.py` after qualification/checksum checks. Historical evaluations remain unchanged from Pages artifact run `37659580012`.
- Both FPM variants preserve all scores and counts. Existing randomized regression retention causes independent-run MAPE variation, documented in the source migration evidence.
- This is a manually published review snapshot. Production Pages and HF main are unchanged; the preview does not automatically follow PR pushes.
- Original copyright, license, and attribution notices are preserved in `LICENSE`, `THIRD_PARTY_NOTICES.md`, and copied assets.
