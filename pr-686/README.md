# AgentX comparison dashboard preview

- [Open AgentX](https://simone-chen.github.io/aisimulate-previews/pr-686/e2e-accuracy/?tab=agentx&branch=simonec%2Fagentx-opdata-preview).
- Dashboard: [AISimulate PR #686](https://github.com/ai-dynamo/aisimulate/pull/686), UI source commit `2c71cea960d90e7f6ebea3a5bcab323ed6860824`; producer source commit `214f1aae83b36199dba3152558c3b6ee5397f8b7`.
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

- Comparison timelines show ten minutes per screen with horizontal scrolling and previous/next buttons. The six GLM profiles each span six windows; the final window includes up to one minute of terminal drain and labels its actual end. Request labels stay pinned, compact 22-pixel rows retain both intervals, and resizing preserves the selected time range. All six GLM profiles, keyboard paging, scrolling, mobile resizing, request inspection, and ordinary offline reports passed browser checks. Numerical results remain unchanged.

- Plots and expanded charts omit the “Comparison coverage and exclusions” accordion while retaining MAPE badges and scored-request counts. The underlying numerical evidence is unchanged.

- The footprint comparison has two stacked panels: Silicon/AISim above, signed AISim-minus-Silicon difference below. Long runs default to 60-second averages; short runs use Raw. The toggle is available in the card and expanded chart, with shared zoom. Missing observations remain gaps, zeros are included, and original one-second Curve MAPE is unchanged. Numeric bucket, gap, partial-bin, mobile, theme, and offline replay checks passed.

- AgentX omits the Speculative acceptance length and Prefix cache hit rate per interval subplots. Browser checks covered GLM and Qwen profile/preparation views and confirmed both charts remain in ordinary replay exports.

- The Benchmark features checklist sits to the left of Concurrency summary in one bordered, equal-height row; on mobile the checklist comes first. It now shows exactly eight fields: prefix caching, sub-block prefix reuse, host/storage offload, hybrid KV/state cache, speculative decoding, Dynamo - KVCR, and Dynamo - KV-aware routing. On, Off, N/A, and Unknown remain distinct; workload/topology details stay outside this checklist. All 42 historical runs retain their saved feature inventories.

- Historical feature evidence is pinned separately at HF revision `d289b4242d1e28a181931eedb4464f07243ab0fa`, while measurement/prediction provenance remains at dataset revision `da115d648f0be20a1c4e0408d552a4a1e8bebf9d`. The versioned feature sidecar and its advertised checksum passed the trusted publisher; all 44 existing numerical/qualification JSON files remain byte-identical. The private dataset review candidate is updated; promotion to main remains pending.

## Latest data refresh — November 2, 2026

- Publish the latest committed dashboard assets, including explicit metric denominators/exclusions in Evidence and a repository link for the feature taxonomy revision.
- All 42 existing numerical results remain unchanged and qualified. All 42 saved HF feature inventories are included through the checksum-pinned sidecar; its dataset revision remains separate from the evaluated measurement revision.
- The new 14-lane Qwen Weka pilot completed its 600-second silicon admission window. CPU investigation confirmed that `server_unsettled` records an expected cancellation after 30 seconds of grace: 492 profiling requests completed, one canceled, zero client requests remained, and cancellation did not time out. The corrected pilot and daily qualification checks accept only fully reconciled cutoff cancellation. Collection remains at 0.78 of eight node-hours; no full profiles have resumed.
- The original failed qualification archive and its 36-feature record remain private and unchanged. The corrected CPU replay passes functional qualification with 420 matched silicon requests, one missing prediction and one measured cancellation. These pilot results are excluded from public accuracy payloads; replacement coverage awaits all six full profiles and the complete 12-replay campaign.

- Timeline windows show only request pairs with a silicon or AISim interval overlapping the visible range. Scrolling and paging remove other rows; boundary-crossing requests stay visible with clipped intervals. Full-phase counts and scores are unchanged. Browser checks cover exact boundaries, separated counterparts, failed/unmatched and untimed requests, empty windows, scrolling, mobile resizing, and all six windows of the real GLM 1/14-lane profiles.

- Overview request columns show TPOT MAPE before TTFT MAPE, with matching values and denominators.

- Preview refresh at source `214f1aae83b36199dba3152558c3b6ee5397f8b7`: update asset cache keys and qualification provenance. Existing 42 numerical results, feature sidecar, dataset revision and evaluated-wheel provenance remain byte-identical. No additional GPU collection or incomplete campaign publication.

- An information icon before Point TPOT error briefly contrasts the aggregate result across conversation requests with averaging individual request errors. It explains that tool-call waits are excluded from TTFT/TPOT calculations, and point error can be smaller because over- and under-predictions cancel when averaged. Metrics and provenance retain the calculation details. Desktop hover, keyboard focus/Escape, touch, both themes, and mobile bounds passed browser checks. Numerical results are unchanged.

## Qwen collection attempt — November 3, 2026

- Qualified one-hour profiles at 1 lane (484 measured credits, one cancellation) and 4 lanes (667 measured requests, no failures); both retain all 36 feature records.
- The 8-lane server remained in checkpoint loading at the 30-minute startup deadline, with 93/94 shards loaded. No 8-lane measurement started; 10/13/14 lanes were not attempted. Collection stopped under the agreed qualification rule.
- GPU allocations consumed 12798/28800 seconds (3.56 node-hours). Partial silicon and failure evidence remain private and explicitly unscored.
- No replacement campaign was published. Existing 42-run numerical results and the feature sidecar remain unchanged; the six-profile/twelve-replay publication gate still applies.

## Eight-field checklist layout — November 3, 2026

- UX-only refresh: no HF, schema, CI parity, prediction, or numerical data changes. The legacy combined Planner/routing flag is not reinterpreted as router state.
- Missing silicon sub-block/router settings, offload scope, state-cache type, and speculative method/actual draft length stay Unknown. Current public artifacts have no applicable AISim support assessment; no support maximum or unsupported-draft label is fabricated. Populated fields and parity integration await separately planned metadata/CI work.
- Validation: 65 UI tests, AgentX browser checks, and real GLM/Qwen data in light/dark themes and mobile. The eight-field order, equal-height panels, keyboard expansion, selected-run behavior, and unchanged concurrency values passed.

- Removed the separate Combination support section; the eight-feature checklist and equal-height layout remain. The existing UI tests and browser checks pass. Numerical evidence and feature metadata are unchanged.

## Silicon and AISim feature columns

- Each of the eight feature rows now has separate Silicon and AISim status cells. Feature names have no icons; On has a green dot, Off a red dot, and Unknown a question mark. The explanatory footer is removed; provenance remains visible and cell tooltips explain missing evidence.
- Silicon states come only from recorded silicon metadata. AISim states come from the selected run's configuration projection: prefix caching is On in both models, speculation is On with draft length 3 for GLM and Off for Qwen. The other six AISim settings remain Unknown in historical artifacts. An explicit per-feature unsupported value is displayed separately from Off; whole-run failures do not identify unsupported features.
- Validation: 66 UI tests and AgentX browser checks pass, including source separation, explicit unsupported states, missing/invalid/conflicting settings, and unclamped draft length. Real GLM/Qwen pages passed light/dark themes, equal-height layout, selected-run changes, and 320/390-pixel mobile bounds. All 46 existing JSON artifacts remain unchanged.

- Speculative decoding now shows matching Method and Draft length badges under both Silicon and AISim when On. AISim method uses an explicit recorded setting; historical results lack that field and show Unknown. Draft length remains 3 for GLM; Qwen stays Off without badges. All 67 UI tests and browser checks passed, including both themes and mobile bounds. Numerical payloads and feature evidence are unchanged.
