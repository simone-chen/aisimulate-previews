# AgentX comparison dashboard preview

- [Open AgentX](https://simone-chen.github.io/aisimulate-previews/pr-686/e2e-accuracy/?tab=agentx&branch=simonec%2Fagentx-opdata-preview).
- Dashboard: [AISimulate PR #686](https://github.com/ai-dynamo/aisimulate/pull/686), UI commit `847960341671b9e0914691c7d1dc14f655ed9ccc`.
- Evaluated wheel: integration commit `1c753e4668310705b6451ba1ebf3061b3d5b30de`, SHA256 `dff8896a4c374c4e21597076cbf356e8611a0f021ba57ba85313e4ec6fa0530c`.
- Op-data dependencies remain outside the dashboard PR: #664 at `36a69a683c60081e61d6379f868b1c7257e1a41e`, #665 at `64ac539813677d15e58c8ba051a6b5fc95c5334b`, and #666 at `d8054a56115238776438f2c4ba59fe295a2db430`.
- Selected prediction databases: B300 SGLang 0.5.21 and vLLM 0.31.0. Measured framework versions are recorded separately in the dashboard.
- Silicon dataset revision: `da115d648f0be20a1c4e0408d552a4a1e8bebf9d`. The private dataset is not linked. Self-collected public evidence remains “coming soon.”
- All 42 replays completed afresh. Qwen matched all 2,016 measured requests. GLM retained all 8,747 measured requests: 8,624 matched, 37 measured failures, and 86 missing predictions; 295 extra predictions are counted separately.
- Independent audit reproduced the five metrics and 828 curve scores, checked 21,907 native timestamps and 2,142 Qwen cache records. Preparation is unscored; accuracy remains advisory.
- Browser validation covered nine concurrency pages, all 36 Qwen selections, four detail tabs, request inspection, deep links, branch isolation, mobile layout, keyboard access, and system/manual themes. Standalone replay exports also passed offline checks.
- The versioned publication artifact passed checksum, accounting, provenance, and public-field validation. Only the prepared public site is included; no raw inputs or intermediate experiment outputs are uploaded.
- This is a manually published review snapshot. It does not follow PR pushes automatically. Production rollout still requires reviewed dataset promotion and the op-data dependencies landing.
- Apache-2.0 source and existing third-party attribution notices are preserved.
