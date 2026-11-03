# AgentX comparison dashboard preview

- [Open AgentX](https://simone-chen.github.io/aisimulate-previews/pr-686/e2e-accuracy/?tab=agentx&branch=simonec%2Fagentx-opdata-preview).
- Dashboard: [AISimulate PR #686](https://github.com/ai-dynamo/aisimulate/pull/686), UI commit `6e7bced055bc1ee0db59a100de0435f1a7b66e92`.
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

- One Concurrency summary table appears above the Dashboard charts, covering all variants and repeats. The Accuracy tab and Request accounting section are removed; older Accuracy links open the Dashboard. Qwen selectors, mobile layout, and a fresh offline replay export passed browser checks.

- Official and self-collected source labels use compact blue pill badges sized to their text, matching the NEW badge style. Both themes were checked.

- Comparison charts and request timelines use solid blue for silicon and solid yellow for AISim. Only Cumulative prompt token sources uses dotted lines, for cache misses; cache hits use solid lines. Failed requests retain a red outline. Browser checks covered GLM and Qwen curves, expanded charts, and timeline inspection in both themes.

- The compact Concurrency summary uses five metric rows with Silicon, AISim, error, and sample columns. Request TTFT and TPOT show source averages over their scored matched requests; point rows retain equal-run averages. Error scores remain unchanged. Qwen selections reuse the loaded concurrency details, and mobile sample counts sit below each error. All 42 runs reconcile with the overview; GLM and Qwen, both themes, and mobile passed browser checks.

- Detail pages include a left-arrow link back to the AgentX overview, preserving the selected branch.

- Qwen runs contain eight measured requests per lane, whereas GLM uses one-hour AgentX profiles with recorded variable prompts and warmup state. Qwen has no continuous silicon scheduler/cache measurements. The footprint reference now renders, and charts explicitly label unavailable silicon references or AISim-only histograms.

- Comparison timelines fit the full phase across the panel. Compact 22-pixel rows put the conversation hash and request ID on one line; paired source intervals remain separately selectable. GLM and Qwen request counts, inspection, keyboard access, and mobile layout passed browser checks.

- Plots and expanded charts omit the “Comparison coverage and exclusions” accordion while retaining MAPE badges and scored-request counts. The underlying numerical evidence is unchanged.

- The footprint comparison has two stacked panels: Silicon/AISim above, signed AISim-minus-Silicon difference below. Long runs default to 60-second averages; short runs use Raw. The toggle is available in the card and expanded chart, with shared zoom. Missing observations remain gaps, zeros are included, and original one-second Curve MAPE is unchanged. Numeric bucket, gap, partial-bin, mobile, theme, and offline replay checks passed.
