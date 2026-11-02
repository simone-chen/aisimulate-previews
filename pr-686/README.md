# AgentX comparison dashboard preview

- [Open AgentX](https://simone-chen.github.io/aisimulate-previews/pr-686/e2e-accuracy/?tab=agentx&branch=simonec%2Fagentx-opdata-preview).
- Dashboard: [AISimulate PR #686](https://github.com/ai-dynamo/aisimulate/pull/686), UI commit `23419e47805411fbaa800aa1947b965d9e0f1c1a`.
- Evaluated wheel: integration commit `1c753e4668310705b6451ba1ebf3061b3d5b30de`, SHA256 `dff8896a4c374c4e21597076cbf356e8611a0f021ba57ba85313e4ec6fa0530c`.
- Op-data dependencies remain outside the dashboard PR: #664 at `36a69a683c60081e61d6379f868b1c7257e1a41e`, #665 at `64ac539813677d15e58c8ba051a6b5fc95c5334b`, and #666 at `d8054a56115238776438f2c4ba59fe295a2db430`.
- Selected prediction databases: B300 SGLang 0.5.21 and vLLM 0.31.0. Measured framework versions are recorded separately in the dashboard.
- Silicon dataset revision: `da115d648f0be20a1c4e0408d552a4a1e8bebf9d`. The private dataset is not linked. Self-collected public evidence remains “coming soon.”
- All 42 replays completed afresh. Qwen matched all 2,016 measured requests. GLM retained all 8,747 measured requests: 8,624 matched, 37 measured failures, and 86 missing predictions; 295 extra predictions are counted separately.
- Independent audit reproduced the five metrics and 828 curve scores, checked 21,907 native timestamps and 2,142 Qwen cache records. Preparation is unscored; accuracy remains advisory.
- Browser validation covered nine concurrency pages, all 36 Qwen selections, three detail tabs, request inspection, deep links, branch isolation, mobile layout, keyboard access, and system/manual themes. Standalone replay exports also passed offline checks.
- The versioned publication artifact passed checksum, accounting, provenance, and public-field validation. Only the prepared public site is included; no raw inputs or intermediate experiment outputs are uploaded.
- This is a manually published review snapshot. It does not follow PR pushes automatically. Production rollout still requires reviewed dataset promotion and the op-data dependencies landing.
- Apache-2.0 source and existing third-party attribution notices are preserved.

- Model summaries use the overview’s full-row tint and stronger text; concurrency subrows retain the page surface and hover/keyboard-focus highlight. Light and dark themes were checked.

- The beta support-matrix notice appears only on the AgentX overview. Self-collected evidence is labeled “AISim self-collected dataset: coming soon.”

- Profile accuracy tables appear above the Dashboard charts. The Accuracy tab and Request accounting section are removed; older Accuracy links open the Dashboard. Qwen selectors, mobile layout, and a fresh offline replay export passed browser checks.

- Official and self-collected source labels use compact blue pill badges sized to their text, matching the NEW badge style. Both themes were checked.

- Comparison charts and request timelines use blue for silicon and yellow for AISim. Multi-metric curves retain distinct line patterns; failed requests retain a red outline. Browser checks covered 36 comparison series, expanded charts, and timeline legends in both themes.

- The selected-run accuracy table includes request MAPE and its scored-request count beside point error. Numeric columns align, metric labels use an unshaded background, and table borders are rounded. Values, counts, Qwen selection, mobile layout, and both themes passed browser checks.

- Detail pages include a left-arrow link back to the AgentX overview, preserving the selected branch.

- Qwen runs contain eight measured requests per lane, whereas GLM uses one-hour AgentX profiles with recorded variable prompts and warmup state. Qwen has no continuous silicon scheduler/cache measurements. The footprint reference now renders, and charts explicitly label unavailable silicon references or AISim-only histograms.
