# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

"""Compare qualified public DB/HF summaries; run from any working directory."""

import json
import math
import hashlib
from collections import defaultdict, Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def flatten(summary):
    groups = defaultdict(list)
    for model in summary["models"]:
        for workload in model["workloads"]:
            for gpu in workload["gpus"]:
                for topology in gpu["topologies"]:
                    for point in topology["points"]:
                        key = (
                            model["model"],
                            workload["identity"],
                            gpu["gpu"],
                            topology["framework"],
                            topology["precision"],
                            topology["spec_method"],
                            topology["serving"],
                            topology["is_multinode"],
                            topology["total_gpus"],
                            json.dumps(topology["parallelism"], sort_keys=True),
                            point["concurrency"],
                            point["infx_run_id"],
                        )
                        groups[key].append(point)
    return groups


def overview(summary):
    c = summary["snapshot"]["campaign"]
    return {
        "run_id": c["run_id"],
        "commit": c["commit_sha"],
        "source": summary["snapshot"]["release_tag"],
        "selected": c["selected"],
        "published": c["published"],
        "outcomes": c["outcomes"],
        "configuration": c.get("configuration"),
        "totals": summary["totals"],
    }


old = json.loads((ROOT / "db-baseline/summary.json").read_text())
new = json.loads((ROOT / "e2e-accuracy/summary.json").read_text())
a, b = flatten(old), flatten(new)
common = set(a) & set(b)
matched = [key for key in common if len(a[key]) == len(b[key]) == 1]
report = {
    "baseline": overview(old),
    "hf": overview(new),
    "input_comparison": json.loads((ROOT / "input-comparison.json").read_text()),
    "scope": "Shared STP points; MTP is new and has no published baseline in this comparison.",
    "comparison": {
        "matching": "model, workload, GPU, framework, precision, serving topology, concurrency, exact producer run",
        "shared_keys": len(common),
        "unambiguous_shared_points": len(matched),
        "ambiguous_shared_keys": len(common) - len(matched),
        "baseline_only_keys": len(set(a) - set(b)),
        "hf_only_keys": len(set(b) - set(a)),
    },
}
r = report["comparison"]
r["measurement_changes"] = sum(
    any(
        a[k][0]["measured"].get(m) != b[k][0]["measured"].get(m)
        for m in ["ttft_ms", "tpot_ms", "e2e_ms", "output_per_gpu", "total_per_gpu"]
    )
    for k in matched
)
r["configuration_changes"] = sum(
    a[k][0].get("configuration") != b[k][0].get("configuration") for k in matched
)
r["quality_transitions"] = dict(
    Counter(
        str(a[k][0].get("configuration_quality"))
        + " -> "
        + str(b[k][0].get("configuration_quality"))
        for k in matched
    )
)
for predictor, status in [("aisimulate", "status"), ("aic", "aic_status")]:
    detail = {
        "status_transitions": dict(
            Counter(a[k][0][status] + " -> " + b[k][0][status] for k in matched)
        ),
        "metrics": {},
    }
    for metric in ["ttft_ms", "tpot_ms", "e2e_ms", "output_per_gpu", "total_per_gpu"]:
        pairs = [
            (a[k][0][predictor].get(metric), b[k][0][predictor].get(metric))
            for k in matched
            if a[k][0][status] == b[k][0][status] == "success"
        ]
        valid = [(x, y) for x, y in pairs if x is not None and y is not None]
        changed = [
            (x, y)
            for x, y in valid
            if not math.isclose(x, y, rel_tol=1e-9, abs_tol=1e-9)
        ]
        detail["metrics"][metric] = {
            "comparable": len(valid),
            "changed": len(changed),
            "max_absolute_delta": max((abs(y - x) for x, y in valid), default=None),
            "max_relative_delta_pct": max(
                (100 * abs(y - x) / abs(x) for x, y in valid if x), default=None
            ),
        }
    r[predictor] = detail
print(json.dumps(r, indent=2))

method_counts = {}
for name, groups in [("baseline", a), ("hf", b)]:
    counts = Counter()
    for key, points in groups.items():
        for point in points:
            counts[(key[5], point["status"])] += 1
    method_counts[name] = {
        method: {status: count for (m, status), count in counts.items() if m == method}
        for method in sorted({m for m, _ in counts})
    }
report["decoding_coverage"] = method_counts
report["qualification"] = {}
for name, directory in [("baseline", "db-baseline"), ("hf", "e2e-accuracy")]:
    q = json.loads((ROOT / directory / "qualification.json").read_text())
    digest = hashlib.sha256(
        (ROOT / directory / "summary.json").read_bytes()
    ).hexdigest()
    if q["summary_sha256"] != digest or q["status"] != "complete":
        raise ValueError("Unqualified summary: " + name)
    report["qualification"][name] = {
        "summary_sha256": digest,
        "run_id": q["run_id"],
        "commit_sha": q["commit_sha"],
        "wheel_sha256": q["wheel_sha256"],
        "exclusion_reasons": q["exclusion_reasons"],
        "measurement_filter_counts": q["measurement_filter_counts"],
    }
(ROOT / "comparison.json").write_text(json.dumps(report, indent=2) + "\n")
