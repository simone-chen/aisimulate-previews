# PR #512: HF E2E input migration preview

- Pipeline and qualification passed; numerical parity is not achieved.
- [HF dashboard](e2e-accuracy/) and [DB baseline](db-baseline/).
- [Comparison report](comparison.json) records cohort differences, matched metrics and known DB-identity binding gaps.
- HF run: https://github.com/ai-dynamo/aisimulate/actions/runs/39306484930, attempt 1.
- Baseline run: https://github.com/ai-dynamo/aisimulate/actions/runs/39237616407, attempt 1.
- HF dashboard source: `ai-dynamo/aisimulate` commit `6215ed1a8859608c760d6866b9d237c7cf34aa03`, files `pages/e2e-accuracy/{index.html,styles.css,app.js}`.
- Baseline dashboard source: the same paths at `c9e7363bf5983b980fe6622f7b064ee7adff5f5d`.
- Dashboard files retain NVIDIA copyright and Apache-2.0 notices; root LICENSE and THIRD_PARTY_NOTICES.md are preserved.
- Measurement attribution: SemiAnalysis InferenceX. HF source: private `ai-dynamo/aisim-infx-cache` at `8ec77d043d236ae92aa0cee6a9896f8195ea7718`.
- Only validated dashboard payloads and aggregate comparisons are published. Raw HF observations, encrypted CI evidence and tokens are excluded.
- Summary and qualification files are copied unchanged from their CI artifacts. Hashes and campaign identity were verified locally.
- Chromium: HF overview, details charts, point dialog, mobile overflow and JavaScript error checks passed; the DB baseline also rendered successfully.

## Summary hashes

- `e2e-accuracy/summary.json`: SHA-256 `f743edcaac80fb5f8f91b1ac30075d31be0cf05609af8f134aa3df33a044ed89`.
- `db-baseline/summary.json`: SHA-256 `0b4abf753ba7f41273aebda68d02028200cfe8c7360187ff6ff106ebc6f52e2d`.

## Pending migration validation

- The dashboard above still contains the earlier campaign. The corrected stack is
  `30b264ae91bf5a4fdad1ab75d3a85114f2e09094`; its [fresh campaign](https://github.com/ai-dynamo/aisimulate/actions/runs/39335708203) is awaiting runner capacity.
- [Input audit](input-comparison.json) records the exact pinned table hashes,
  DB v3 / HF v2 selection and exclusion counts, shared identities, and evidence
  binding checks for the corrected stack. It does not certify replay parity.
- All 124 affected STP cases have matching complete deployment outcomes:
  93 resolved, 31 unresolved for the same reasons.
- `python3 pr-512/compare.py` regenerates `comparison.json` from the qualified
  summaries currently present. It validates summary hashes, compares shared STP
  metrics, excludes ambiguous keys, and counts STP/MTP results separately.
- Predictor source under `python/aisimulate/src` and `crates` is unchanged between
  the DB baseline commit and the corrected stack. The workflow will build a new
  wheel; source equivalence does not imply byte-identical wheel artifacts.
