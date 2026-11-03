# AgentX portable-schema review preview

- [Open the refreshed dashboard](https://simone-chen.github.io/aisimulate-previews/pr-686/e2e-accuracy/?tab=agentx&branch=simonec%2Fagentx-opdata-preview&v=1d94a36f5).
- Dashboard and CI: [AISimulate PR #686](https://github.com/ai-dynamo/aisimulate/pull/686), source `1d94a36f5e3004e53bca4046e056f2069369f04e`.
- HF candidate revision: `59a615da5ffa27ba1f206c0940ec99c3459babeb`. The dataset is private; no public dataset migration or promotion occurred.
- Display only the newer Qwen Weka measurements; remove the older finite Qwen campaign from this preview.
- Fresh CPU replay of six active GLM points and the retained Qwen Weka 1-/4-lane profiles. All eight completed and passed complete selected-cohort accounting and strict public-field validation. The five accuracy metrics were independently reproduced from observations and native replay records.
- The Qwen silicon campaign remains failed/incomplete and unscored: 8-lane startup exceeded its deadline; 10/13/14 lanes were unattempted. This explicitly labeled partial preview does not qualify the silicon campaign or satisfy the six-profile/twelve-replay promotion gate.
- Qwen retains all 1,151 measured credits: 1,148 matched, one cancellation and two missing predictions. Extra predicted requests are counted separately. Preparation is unscored and accuracy remains advisory.
- Evaluated integration wheel: commit `77da57c599994055c04b36027d39d34ac11918e4`, SHA256 `b90910c00462abe235e0089920dbdb57d77b7042a5efcbe1c43d71634dd41237`. The evaluated wheel and CI producer revision are recorded separately.
- Op-data dependencies #664/#665/#666 remain outside dashboard PR #686. Prediction databases remain B300 SGLang 0.5.21 and vLLM 0.31.0; measured framework versions are shown separately.
- HF supplies readable silicon bundles, upstream corpus references, and eight curated feature records. CI checks manifests, artifact hashes, evidence pointers, reconstructed corpus hashes and filtering order, and requalifies cache geometry from recorded worker ranks.
- Only sanitized numerical dashboard artifacts and static assets are published. Prompts, token arrays, raw events, logs, paths and private evidence remain local/private. Existing Apache-2.0 and third-party attribution notices are preserved.
- This manually published review snapshot does not update on PR pushes. Dataset promotion, op-data merges and production rollout remain separate.

## Effective AISim feature recording

- All eight fresh executions record typed defaults, compiled role settings and runtime observations inside the exact evaluated wheel process. Structured CI records bind benchmark, AISim revision and silicon dataset revision; private full configs/specs remain outside this public site and HF.
- The AISim column uses these records, with no display-label matching or fallback to silicon. Prefix caching is on; G2/G3 and KVCR are off; Dynamo KV-aware routing is N/A for this native offline stack. GLM has MTP on and hybrid state cache off; Qwen has MTP off and hybrid state cache on. Both use full-block matching.
- GLM's raw SGLang draft parameter 4 includes the seed: three proposals plus one seed, matching AISim nextn=3 and verification width 4. The raw silicon value remains intact. Acceptance 1.99 is separate. Real normalized mismatches and scoped unsupported bounds remain explicit.
- Preserve per-role differences and unknown observed exercise. New completed runs require effective records; legacy missing records are never filled with current defaults.
- All eight prior numerical results, request errors, coverage and pairs reproduce exactly. Local checks: 677 tests and 138 subtests, 81 UI/workflow checks, exact Python static checks and the AgentX browser suite.
