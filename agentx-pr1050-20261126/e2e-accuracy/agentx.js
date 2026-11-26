/* SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0 */
"use strict";
window.AgentX = (() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const finite = value => typeof value === "number" && Number.isFinite(value);
  const avg = values => { const valid = values.filter(finite); return valid.length ? valid.reduce((a,b) => a+b,0)/valid.length : null; };
  const fmt = (v, suffix = "%") => finite(v) ? `${v.toLocaleString(undefined,{maximumFractionDigits:2})}${suffix}` : "—";
  const metrics = ["tpot_ms", "ttft_ms", "output_tokens_s"];
  let generation = 0, activeBranch = null;

  function aggregate(runs) {
    const coverage = {};
    runs.forEach(run => Object.entries(run.coverage).forEach(([key,n]) => coverage[key] = (coverage[key] || 0) + n));
    const request_errors = {};
    for (const metric of ["ttft_ms","tpot_ms"]) {
      const count = runs.reduce((n,r) => n+r.request_errors[metric].count,0);
      const sum = runs.reduce((n,r) => n+r.request_errors[metric].sum_ape,0);
      let silicon=null,prediction=null;
      if(runs.every(r=>Array.isArray(r.pairs))) {
        const pairs=runs.flatMap(r=>r.pairs).filter(p=>finite(p[metric+"_ape"]));
        if(pairs.length!==count || pairs.some(p=>!finite(p["silicon_"+metric]) || !finite(p["predicted_"+metric]))) throw new Error("Request measurements do not reconcile with scored counts.");
        silicon=avg(pairs.map(p=>p["silicon_"+metric]));
        prediction=avg(pairs.map(p=>p["predicted_"+metric]));
      }
      request_errors[metric] = {count, sum_ape:sum, mape:count ? sum/count : null,silicon,prediction};
    }
    const values=Object.fromEntries(["silicon","prediction"].map(source=>[source,Object.fromEntries(metrics.map(m=>[m,avg(runs.filter(r=>finite(r.point_errors[m])).map(r=>r[source]?.[m]))]))]));
    return {...values,point_errors:Object.fromEntries(metrics.map(m => [m,avg(runs.map(r => r.point_errors[m]))])),point_counts:Object.fromEntries(metrics.map(m=>[m,runs.filter(r=>finite(r.point_errors[m])).length])),request_errors,coverage};
  }

  const performanceNames={op_level:"Op-based",fpm_learned:"Learned FPM",fpm_interpolation:"FPM interpolation",fpm_regression:"FPM regression"};
  const estimationOf=run=>run.performance_model||run.config_summary?.find(item=>item.name==="Estimation")?.value;
  function performanceModel(runs, compact=false) {
    return [...new Set(runs.map(run => {
      const estimation=estimationOf(run), name=performanceNames[estimation] || estimation || "Unrecorded";
      return compact?name:`${name} perf model (${run.backend} ${run.prediction_backend_version || "version unrecorded"})`;
    }))].join("; ");
  }
  const performanceClass=runs=>runs.some(r=>estimationOf(r)==="fpm_learned")?"agentx-learned":"agentx-op";
  const REQUEST_METRICS=[["tpot_ms","e2e"],["ttft_ms","e2e"],["tpot_ms","quantile"],["ttft_ms","quantile"]];
  function cpuOverhead(run){
    const c=run.cpu_overhead;if(!c)return "—";
    const us=v=>finite(v)?String(Math.round(v*1e6)/1e3):"?", ms=v=>finite(v)?String(Math.round(v*100)/100):"?";
    const t=c.tokenization,x=c.extra_cpu_overhead;
    const tok=t?`Tokenizer (queued, ${t.workers} worker${t.workers===1?"":"s"}): ${t.base_ms?ms(t.base_ms)+" ms + ":""}${us(t.per_input_token_ms)} µs/token`:"Tokenizer (queued): none";
    const ext=x?`Unqueued: ${ms(x.base_ms)} ms + ${us(x.per_input_token_ms)} µs/token`:"Unqueued: none measured";
    return `<span class="agentx-cpu">${esc(tok)}</span><span class="agentx-cpu">${esc(ext)}</span>`;
  }
  function specDec(run){
    const f=(run.simulation_features?.roles||[]).flatMap(r=>r.features).find(x=>x.id==="speculation");
    const m=f?.parameters?.method;
    if(!m||m==="off"||f.state!=="enabled")return "None";
    const d=f.parameters.draft_length;
    return `${esc(m.toUpperCase())}${d?`<small>${esc(d)} draft tokens</small>`:""}`;
  }
  // Request metrics: equal-weight mean over runs; stderr sqrt(sum se²)/n. Steps: pooled sums over runs.
  function requestAggregate(runs){
    const out={};
    for(const [m,k] of REQUEST_METRICS){
      const rows=runs.map(r=>r.accuracy_metrics?.[m]).filter(x=>x&&finite(x[k]));
      const n=rows.length;
      out[m+"/"+k]=n?{v:rows.reduce((s,r)=>s+r[k],0)/n,se:rows.every(r=>finite(r[k+"_se"]))?Math.sqrt(rows.reduce((s,r)=>s+r[k+"_se"]**2,0))/n:null,req:rows.reduce((s,r)=>s+r.n,0),runs:n}:null;
    }
    out.excluded=runs.reduce((s,r)=>s+(r.accuracy_metrics?.tpot_ms?.excluded||0),0);
    return out;
  }
  function stepAggregate(runs){
    const steps=runs.map(r=>r.accuracy_metrics?.step).filter(Boolean);
    const out={dropped:steps.reduce((s,x)=>s+x.dropped_shifted,0)};
    for(const kind of ["decode","prefill"]){
      const n=steps.reduce((s,x)=>s+x[kind].n,0),sum=steps.reduce((s,x)=>s+x[kind].sum_ape,0),sq=steps.reduce((s,x)=>s+x[kind].sum_sq_ape,0);
      out[kind]=n>1?{mape:sum/n,se:Math.sqrt(Math.max(sq-n*(sum/n)**2,0)/(n-1)/n),n}:null;
    }
    return out;
  }
  const errorText=(v,se,digits=1)=>`${v.toFixed(digits)}%${finite(se)?` <span class="agentx-se">± ${se.toFixed(digits)}</span>`:""}`;
  function cells(runs){
    const a=requestAggregate(runs),step=stepAggregate(runs);
    const sc=k=>{const x=step[k];return x?`<td class="agentx-metric">${errorText(x.mape,x.se)}<small>n=${x.n.toLocaleString()} steps</small></td>`:'<td class="agentx-metric">—</td>';};
    return sc("decode")+sc("prefill")+REQUEST_METRICS.map(([m,k])=>{const x=a[m+"/"+k];return x?`<td class="agentx-metric">${errorText(x.v,x.se)}<small>n=${x.req.toLocaleString()} req${x.runs>1?` · ${x.runs} runs`:""}${m==="tpot_ms"&&k==="e2e"&&a.excluded?` · ${a.excluded} excluded &lt;1 ms`:""}</small></td>`:'<td class="agentx-metric">—</td>';}).join("");
  }
  function metricsTable(runs){
    const a=requestAggregate(runs),st=stepAggregate(runs);
    const srow=(k,label)=>{const x=st[k];return x?`<tr data-metric="step-${k}"><th scope="row">${label}</th><td>${x.mape.toFixed(2)}%</td><td>± ${x.se.toFixed(2)}%</td><td class="agentx-samples">${x.n.toLocaleString()} steps</td></tr>`:"";};
    const row=(m,k,label)=>{const x=a[m+"/"+k];return x?`<tr data-metric="${k}-${m}"><th scope="row">${label}</th><td>${x.v.toFixed(2)}%</td><td>${finite(x.se)?`± ${x.se.toFixed(2)}%`:"—"}</td><td class="agentx-samples">${x.req.toLocaleString()} requests</td></tr>`:"";};
    return `<h3 class="agentx-metrics-title">Accuracy metrics (unsigned)</h3><div class="table-scroll"><table class="agentx-summary-table agentx-metrics-table"><thead><tr><th scope="col">Metric</th><th scope="col">Error</th><th scope="col">Stderr</th><th scope="col" class="agentx-samples">Samples</th></tr></thead><tbody>${srow("decode","Step error, decode (held-out steps)")}${srow("prefill","Step error, prefill (held-out steps)")}${row("tpot_ms","e2e","TPOT e2e error (request-average)")}${row("ttft_ms","e2e","TTFT e2e error (request-average)")}${row("tpot_ms","quantile","TPOT per-request quantile error, p5–p95")}${row("ttft_ms","quantile","TTFT per-request quantile error, p5–p95")}</tbody></table></div><p class="agentx-summary-note">Closed-loop replay; matched requests only. Silicon requests with TPOT under 1 ms (burst delivery) are excluded from TPOT: ${a.excluded} here.${st.dropped?` ${st.dropped.toLocaleString()} held-out steps are dropped because SGLang recorded their device time on the adjacent record.`:""} Request-metric stderr is a 1,000-resample bootstrap over requests; step stderr is std/√n over steps.</p>`;
  }
  function comparisonRows(result) {
    return [["tpot_ms","TPOT","ms/token"],["ttft_ms","TTFT","ms"],["output_tokens_s","Output throughput","output tokens/s"]].map(([metric,label,unit])=>{
      const count=result.point_counts[metric], samples=`${count.toLocaleString()} run${count===1?"":"s"}`;
      return `<tr data-metric="point-${metric}"><th scope="row">Point ${label}<small>${unit}</small></th><td>${fmt(result.silicon[metric],"")}</td><td>${fmt(result.prediction[metric],"")}</td><td class="agentx-error"><strong>${fmt(result.point_errors[metric])}</strong><small>Mean point error</small><small class="agentx-inline-count">${samples}</small></td><td class="agentx-samples">${samples}</td></tr>`;
    }).join("");
  }
  const benchmarkFeatureLabels = {
    "cache.g1_prefix":"Prefix caching", "sub-block-prefix":"Sub-block prefix reuse",
    "cache.g2":"Host offload (G2)", "cache.g3":"Storage offload (G3)",
    "cache.hybrid_state":"Hybrid KV/state cache", "speculation":"Speculative decoding",
    "cache.kvcr":"Dynamo - KVCR", "kv-aware-routing":"Dynamo - KV-aware routing",
  };
  function featureChecklist(point) {
    const record=point.feature_metadata;
    const valid=record?.schema==="aisimulate.benchmark.features.v1" && record.benchmark_id===point.id && Array.isArray(record.features);
    const features=new Map((valid?record.features:[]).map(f=>[f.id,f]));
    // Silicon settings never fall back to replay config or support defaults.
    const siliconId=id=>({"sub-block-prefix":"cache.sub_block_prefix_reuse","kv-aware-routing":"routing.kv_aware"}[id]||id);
    const siliconState=id=>features.get(siliconId(id))?.state;
    const parameters=id=>Object.fromEntries((features.get(siliconId(id))?.parameters||[]).map(p=>[p.name,p.value]));
    const simulation=point.simulation_features;
    const simulationValid=simulation?.schema==="aisimulate.agentx.simulation-features.v1" && simulation.benchmark_id===point.id;
    if(simulation && (!simulationValid || (point.snapshot && (simulation.evaluated_revision!==point.snapshot.commit_sha || simulation.dataset_revision!==point.snapshot.dataset_revision)))) throw new Error("Simulation feature evidence identity mismatch.");
    const roles=simulationValid?simulation.roles:[];
    const comparisons=simulation?.speculation_comparison||[];
    const methods={off:"Off",mtp:"MTP",dspark:"DSPARK",eagle3:"EAGLE3",dflash:"DFlash",dflash2:"DFlash2",ngram:"n-gram",draft_model:"Other draft model"};
    const statuses={enabled:["on","On"],disabled:["off","Off"],not_applicable:["na","N/A"],unsupported:["unsupported","Unsupported"],failed_to_record:["unknown","Recording failed"],legacy_missing:["unknown","Legacy missing evidence"]};
    const cellContent=(source,current,details,badges=[])=>{
      const [status,label]=Object.hasOwn(statuses,current) && (source==="aisimulate" || current!=="unsupported")?statuses[current]:["unknown","Unrecorded"];
      const title=status==="unknown"?`${source==="silicon"?"Silicon":"AISim"} setting unavailable in this run's saved evidence.`:
        status==="unsupported"?"Explicitly recorded as unsupported for this AISim run.":`${source==="silicon"?"Silicon":"AISim"} setting: ${label}.`;
      const icon=["on","off","unknown"].includes(status)?`<span class="agentx-status-symbol" aria-hidden="true">${status==="unknown"?"?":""}</span>`:"";
      const labels=badges.length?`<div class="agentx-feature-badges">${badges.map(([key,value])=>`<span class="agentx-feature-badge" aria-label="${esc(key)}: ${esc(value)}"><span class="agentx-feature-badge-key">${esc(key==="Draft length"?"Draft":key)}</span> <span class="agentx-feature-badge-value">${esc(value)}</span></span>`).join("")}</div>`:"";
      return `<span class="agentx-feature-status ${status}" title="${esc(title)}">${icon}${label}</span>${details.map(d=>`<small class="agentx-feature-detail">${esc(d)}</small>`).join("")}${labels}`;
    };
    const rows=Object.entries(benchmarkFeatureLabels).map(([id,name])=>{
      const silicon=siliconState(id), details=[];
      const values=parameters(id), label=value=>value===undefined||value===null||value==="unknown"?"Unrecorded":Array.isArray(value)?value.join(", "):value;
      if(silicon==="enabled" && ["cache.g2","cache.g3"].includes(id)) details.push(`Scope: ${label(values.scope)}`);
      if(silicon==="enabled" && id==="cache.hybrid_state") details.push(`State-cache type: ${label(values.cache_types)}`);
      if(id==="sub-block-prefix" && values.match_granularity_tokens!=null) details.push(`Match granularity: ${values.match_granularity_tokens} tokens`);
      const measured=id==="speculation" && silicon==="enabled"?[["Method",methods[values.method]||"Unrecorded"],["Draft length",label(values.draft_length)]]:[];
      if(id==="speculation" && comparisons.some(c=>c.actual_convention==="verification_width_including_seed")) {
        const c=comparisons.find(c=>c.actual_convention==="verification_width_including_seed");
        details.push(`Raw SGLang value ${c.actual_draft_length} counts ${c.actual_proposals} proposals + 1 seed; verification width ${c.actual_verify_width}.`);
      }
      const simulated=roles.length?roles.map(role=>{
        const feature=role.features.find(f=>f.id===siliconId(id)), p=feature?.parameters||{}, extra=[];
        const comparison=id==="speculation"?comparisons.find(c=>c.role===role.role):null;
        let state=feature?.state||"failed_to_record";
        if(state==="enabled" && ["cache.g2","cache.g3"].includes(id))extra.push(`Scope: ${label(p.scope)}`);
        if(state==="enabled" && id==="cache.hybrid_state")extra.push(`State-cache type: ${label(p.cache_types)}`);
        if(id==="sub-block-prefix" && p.match_granularity_tokens!=null)extra.push(`Match granularity: ${p.match_granularity_tokens} tokens`);
        if(state==="enabled" && feature.observed.state!=="unknown")extra.push(`Observed use: ${feature.observed.state.replaceAll("_"," ")}`);
        if(comparison?.status==="unsupported") {state="unsupported";extra.push(comparison.aisim_max!=null?`Unsupported (actual: ${comparison.actual_draft_length}, AISim max: ${comparison.aisim_max})`:"Unsupported for this evaluated configuration");}
        if(comparison?.status==="mismatch")extra.push(`Mismatch with silicon: ${comparison.actual_method} / ${comparison.actual_proposals} proposed tokens`);
        const badges=id==="speculation" && feature?.state==="enabled"?[["Method",methods[p.method]||p.method||"Unrecorded"],["Draft length",label(p.draft_length)],["Verify width",label(p.verify_width)]]:[];
        return `${roles.length>1?`<small class="agentx-feature-detail">${esc(role.role)}</small>`:""}${cellContent("aisimulate",state,extra,badges)}`;
      }).join(""):cellContent("aisimulate","legacy_missing",[]);
      return `<tr class="agentx-feature" data-feature="${id}"><th scope="row" class="agentx-feature-name">${name}</th><td data-source="silicon">${cellContent("silicon",silicon,details,measured)}</td><td data-source="aisimulate">${simulated}</td></tr>`;
    }).join("");
    return `<aside class="agentx-features" aria-labelledby="agentx-features-title"><div class="agentx-features-heading"><h2 id="agentx-features-title">Feature Parity</h2><a href="../../feature-support-matrix/#agentx">Support matrix ↗</a></div><p class="agentx-feature-scope">Selected run</p><table class="agentx-feature-table" aria-label="Selected run feature settings"><thead><tr><th scope="col">Feature</th><th scope="col">Silicon</th><th scope="col">AISim</th></tr></thead><tbody>${rows}</tbody></table>${point.feature_dataset_revision?`<p class="agentx-feature-revision">🤗 Feature evidence · <code title="${esc(point.feature_dataset_revision)}">${esc(point.feature_dataset_revision.slice(0,12))}</code></p>`:""}</aside>`;
  }
  const pointHelp = `<button type="button" id="agentx-point-info" class="agentx-info" aria-label="About point TTFT and TPOT error" aria-describedby="agentx-point-tooltip"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 7v4"/><circle cx="8" cy="4.5" r="0.6" fill="currentColor" stroke="none"/></svg></button>`;
  const headings = `<tr><th scope="col" rowspan="2">Model / concurrency</th><th scope="col" rowspan="2">SpecDec</th><th scope="col" rowspan="2">Hardware / backend</th><th scope="col" rowspan="2">Performance model</th><th scope="col" rowspan="2">CPU overhead</th><th scope="colgroup" colspan="2" class="agentx-group"><button type="button" id="agentx-step-info" class="agentx-info" aria-label="About step error" aria-describedby="agentx-step-tooltip"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 7v4"/><circle cx="8" cy="4.5" r="0.6" fill="currentColor" stroke="none"/></svg></button> Step error</th><th scope="colgroup" colspan="2" class="agentx-group">${pointHelp} e2e error</th><th scope="colgroup" colspan="2" class="agentx-group"><button type="button" id="agentx-quantile-info" class="agentx-info" aria-label="About per-request quantile error" aria-describedby="agentx-quantile-tooltip"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 7v4"/><circle cx="8" cy="4.5" r="0.6" fill="currentColor" stroke="none"/></svg></button> Per-request quantile error (p5–p95)</th></tr><tr><th scope="col" class="agentx-sub">Decode</th><th scope="col" class="agentx-sub">Prefill</th><th scope="col" class="agentx-sub">TPOT</th><th scope="col" class="agentx-sub">TTFT</th><th scope="col" class="agentx-sub">TPOT</th><th scope="col" class="agentx-sub">TTFT</th></tr>`;
  function bindPointHelp(target, b="#agentx-point-info", t="#agentx-point-tooltip") {
    const button=target.querySelector(b), tooltip=target.querySelector(t);
    let timer;
    const hide=()=>{clearTimeout(timer);if(tooltip.matches(":popover-open"))tooltip.hidePopover();};
    const show=()=>{
      clearTimeout(timer);
      if(!tooltip.matches(":popover-open"))tooltip.showPopover();
      const rect=button.getBoundingClientRect();
      tooltip.style.left=`clamp(8px, ${rect.left}px, calc(100vw - ${tooltip.offsetWidth + 8}px))`;
      tooltip.style.top=`clamp(8px, ${rect.bottom + 8}px, calc(100vh - ${tooltip.offsetHeight + 8}px))`;
    };
    const leave=()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{if(document.activeElement!==button && !button.matches(":hover") && !tooltip.matches(":hover"))hide();},140);
    };
    button.addEventListener("pointerenter",event=>{if(event.pointerType!=="touch")show();});
    button.addEventListener("focus",show);
    button.addEventListener("click",show);
    button.addEventListener("pointerleave",leave);
    button.addEventListener("blur",leave);
    tooltip.addEventListener("pointerenter",()=>clearTimeout(timer));
    tooltip.addEventListener("pointerleave",leave);
    target.querySelector(".table-scroll").addEventListener("scroll",hide);
  }
  function source(run) {
    return run.category === "agentx" ? `<a href="${esc(run.benchmark_url)}" target="_blank" rel="noopener">AgentX benchmark ↗</a> · <a href="${esc(run.source_run_url)}" target="_blank" rel="noopener">Source run ↗</a>` :
      "AISim self-collected dataset: coming soon"; // TODO: link the public self-collected E2E HF dataset after migration.
  }
  function pointUrl(run, branch) {
    const params = new URLSearchParams({branch,category:run.category,model:run.model,lanes:run.lanes,perf:estimationOf(run)||""});
    const campaign=new URL(location.href).searchParams.get("campaign");
    if(campaign) params.set("campaign",campaign);
    return `./agentx/point.html?${params}#view=point&stage=profile&variant=observed`;
  }
  async function json(path) {
    const response = await fetch(path, {cache:"no-cache"});
    if (!response.ok) throw new Error(`Evidence unavailable (HTTP ${response.status}).`);
    return response.json();
  }
  function validateFeatureEvidence(value, summary) {
    if(value?.schema!=="aisimulate.agentx.features.v1" || value.measurement_dataset_revision!==summary.snapshot.dataset_revision || !/^[a-f0-9]{40}$/.test(value.feature_dataset_revision) || !Array.isArray(value.records)) throw new Error("Feature evidence dataset mismatch.");
    const expected=new Set(summary.runs.map(r=>r.id)),seen=new Set();
    for(const record of value.records) {
      const id=record.benchmark_id,metadata=record.feature_metadata;
      if(!expected.has(id)||seen.has(id)||metadata?.schema!=="aisimulate.benchmark.features.v1"||metadata.benchmark_id!==id||!Array.isArray(metadata.features)||!/^[a-f0-9]{64}$/.test(record.feature_artifact_sha256)) throw new Error("Invalid feature evidence identity.");
      seen.add(id);
    }
    if(seen.size!==expected.size)throw new Error("Incomplete feature evidence accounting.");
    return value;
  }
  async function loadFeatureEvidence(loaded) {
    const entry=loaded.entry.feature_evidence;
    if(entry===undefined)return null;
    if(entry.path!==loaded.entry.summary_path.replace(/summary\.json$/,"feature-evidence.json")||!/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error("Invalid feature evidence path or checksum.");
    const response=await fetch(loaded.base+"feature-evidence.json", {cache:"no-cache"});
    if(!response.ok)throw new Error(`Feature evidence unavailable (HTTP ${response.status}).`);
    const bytes=await response.arrayBuffer();
    const digest=[...new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))].map(b=>b.toString(16).padStart(2,"0")).join("");
    if(digest!==entry.sha256)throw new Error("Feature evidence checksum mismatch.");
    return validateFeatureEvidence(JSON.parse(new TextDecoder().decode(bytes)),loaded.data);
  }
  async function summary(branch, prefix) {
    const campaign=new URL(location.href).searchParams.get("campaign");
    if(campaign && !["finite-v1","weka-v1"].includes(campaign)) throw new Error("Unknown benchmark campaign.");
    if(campaign==="finite-v1") prefix+="archive/finite-v1/";
    const catalog = await json(prefix + "branches.json");
    const entry = catalog.branches.find(e => e.branch === branch);
    if (!entry || entry.status !== "evaluated") return null;
    if (!/^branches\/[0-9a-f]{16}\/summary.json$/.test(entry.summary_path)) throw new Error("Invalid evidence path.");
    const data = await json(prefix + entry.summary_path);
    if (data.schema !== "aisimulate.agentx.accuracy.v1" || data.snapshot.branch !== branch) throw new Error("Evidence branch mismatch.");
    return {data,base:prefix + entry.summary_path.replace(/summary.json$/, ""),entry};
  }
  async function load(branch) {
    const target = document.getElementById("agentx-content");
    if (!target || branch === activeBranch) return;
    activeBranch = branch;
    const request = ++generation;
    target.innerHTML = '<p role="status">Loading AgentX evidence…</p>';
    try {
      const loaded = await summary(branch, "./agentx/");
      if (request !== generation) return;
      if (!loaded) { target.innerHTML = '<p role="status">No AgentX evaluation is available for this branch.</p>'; return; }
      const {data,entry} = loaded;
      const archived=new URL(location.href).searchParams.get("campaign")==="finite-v1";
      const activeUrl=new URL(location.href);activeUrl.searchParams.delete("campaign");
      target.innerHTML = `<p class="evidence-brief">${esc(branch)} · evaluated ${esc(data.snapshot.commit_sha.slice(0,12))} · ${esc(data.snapshot.completed_at)}${entry.last_update?.status === "failed" ? " · Update failed; showing previous results" : ""}${data.snapshot.preview ? " · Preview" : ""}${data.snapshot.measurement_campaign_status==="partial" ? " · Partial silicon campaign: only retained profiles are shown; remaining profiles did not qualify. Unscored dataset archive; not eligible for promotion." : ""}</p>` +
        (archived?`<p class="agentx-beta">Archived finite campaign. <a href="${esc(activeUrl)}">View current campaign ↗</a></p>`:"")+
        `<div class="table-scroll"><table class="agentx-table"><thead>${headings}</thead><tbody>${[...new Set(data.runs.map(r=>JSON.stringify([r.category,r.model,r.hardware,r.backend,r.precision,r.tensor_parallel,performanceModel([r],true)])))].map((key,index) => {
          const points=data.runs.filter(r=>JSON.stringify([r.category,r.model,r.hardware,r.backend,r.precision,r.tensor_parallel,performanceModel([r],true)])===key), first=points[0], id=`ax-model-${index}`;
          return `<tr class="agentx-model ${performanceClass(points)}"><th><button type="button" data-agentx-expand="${id}" aria-expanded="false">▸ ${esc(first.model)}</button><small class="source-tag">${first.category==="agentx"?"AgentX official":"Self-collected"}</small></th><td>${specDec(first)}</td><td>${esc(first.hardware)} · ${[...new Set(points.map(r=>`${r.backend} ${r.measured_backend_version || "version unrecorded"}`))].map(esc).join(", ")}<small>${esc(first.precision)} · TP${first.tensor_parallel}</small></td><td class="agentx-perf-model">${esc(performanceModel(points,true))}</td><td>${cpuOverhead(first)}</td>${cells(points)}</tr>` +
            [...new Set(points.map(r=>r.lanes))].sort((a,b)=>a-b).map(lanes=>{
              const matches=points.filter(r=>r.lanes===lanes), point=matches[0], failed=matches.filter(r=>r.outcome!=="completed").length;
              return `<tr hidden class="${performanceClass(points)}" data-agentx-parent="${id}" data-agentx-href="${esc(pointUrl(point,branch))}" tabindex="0" aria-label="${lanes} lanes: open details"><th><a href="${esc(pointUrl(point,branch))}">${lanes} lane${lanes===1?"":"s"} ↗</a><small>${matches.length} run${matches.length===1?"":"s"}${failed?` · ${failed} unavailable`:""}</small></th><td>${specDec(point)}</td><td>${source(point)}</td><td class="agentx-perf-model">${esc(performanceModel(matches,true))}</td><td>${cpuOverhead(point)}</td>${cells(matches)}</tr>`;
            }).join("");
        }).join("")}</tbody></table></div><div id="agentx-point-tooltip" role="tooltip" popover><p><strong>e2e error</strong> compares mean latency over the matched requests: |mean AISim / mean silicon − 1|.</p><p>It is unsigned. ± is the bootstrap standard error over 1,000 request resamples. For TPOT, silicon requests under 1 ms (burst delivery) are excluded.</p></div><div id="agentx-quantile-tooltip" class="agentx-tooltip" role="tooltip" popover><p><strong>Per-request quantile error</strong> compares the distributions of per-request latency. At each percentile p5, p10, …, p95 it takes |AISim percentile / silicon percentile − 1|, then averages the 19 values.</p><p>It is unsigned. ± is the bootstrap standard error. A low per-request quantile error with a high e2e error means the shape matches, but a few tail requests pull the mean.</p></div><div id="agentx-step-tooltip" class="agentx-tooltip" role="tooltip" popover><p><strong>Step error</strong> is the forward-pass model alone: the MAPE of predicted vs measured scheduler-step time, ± std/√n. It uses the held-out seed-7 step capture at the same lane count and the profiling window (Qwen windows also include the client warm-up).</p><p><strong>Prefill</strong>: steps with a prefill chunk and no decode. <strong>Decode</strong>: decode-only steps (GLM: MTP verify rounds). Qwen mixed prefill+decode steps are not shown.</p><p>Learned is the model trained on seed 42 only. The replay uses seeds 42 and 7 pooled. Both models price steps with the replay's compiled timing config. GLM drops steps whose device time SGLang 0.5.20 recorded on the adjacent record: a target forward missing from a step's device-time categories, or a step under 0.5× the held-out model next to one over 1.5×. Both models drop the same steps; the point page shows the count. No model is stored: each evaluation retrains from the pinned captures with a fixed seed.</p></div><details class="agentx-method"><summary>Metrics and provenance</summary>${methodology()}${provenance(data.snapshot,data.runs)}</details>`;
      bindPointHelp(target);bindPointHelp(target,"#agentx-quantile-info","#agentx-quantile-tooltip");bindPointHelp(target,"#agentx-step-info","#agentx-step-tooltip");
      target.querySelectorAll("[data-agentx-href]").forEach(row => {
        row.addEventListener("click", event => { if (!event.target.closest("a,button")) location.href=row.dataset.agentxHref; });
        row.addEventListener("keydown", event => { if (event.key === "Enter" && event.target === row) location.href=row.dataset.agentxHref; });
      });
      target.querySelectorAll("[data-agentx-expand]").forEach(button => button.addEventListener("click", () => {
        const expanded=button.getAttribute("aria-expanded")!=="true";
        button.setAttribute("aria-expanded",String(expanded));
        button.textContent=(expanded?"▾ ":"▸ ")+button.textContent.slice(2);
        target.querySelectorAll(`[data-agentx-parent="${button.dataset.agentxExpand}"]`).forEach(row=>row.hidden=!expanded);
      }));
    } catch (error) {
      if (request === generation) target.innerHTML=`<p role="status">${esc(error.message)}</p>`;
    }
  }

  const githubIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.49c-2.23.48-2.69-.95-2.69-.95-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.22.82 1.22.82.71 1.22 1.87.87 2.33.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.74.54 1.49v2.21c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;
  function methodology() {
    return `<ul class="agentx-notes"><li>Errors are unsigned percentages over uniquely matched requests. e2e error is 100 × |mean AISim / mean silicon − 1| of request TTFT or TPOT. Per-request quantile error averages 100 × |AISim pN / silicon pN − 1| over p5, p10, …, p95.</li><li>± is the standard error: a 1,000-resample bootstrap over requests for request metrics, std/√n over steps for step error. Entries average their runs equally.</li><li>Silicon TPOT under 1 ms is burst delivery, not decode pacing; those requests are excluded from TPOT and counted.</li><li>Step error prices held-out seed-7 step captures at the same lane count. The learned FPM row replays a model retrained from pinned seed-42 and seed-7 captures with a fixed seed and frozen adaptation; its step error uses a seed-42-only model.</li><li>Preparation and warmup are unscored. Missing measurements and zero denominators remain unavailable. No timing calibration.</li></ul>`;
  }
  function provenance(snapshot,runs) {
    return `<ul class="agentx-notes provenance"><li>${githubIcon} <strong>AISim repository commit:</strong> <a href="https://github.com/ai-dynamo/aisim/commit/${esc(snapshot.commit_sha)}" target="_blank" rel="noopener"><code>${esc(snapshot.commit_sha)}</code></a></li><li><span role="img" aria-label="Hugging Face">🤗</span> <strong>Silicon dataset revision:</strong> <code>${esc(snapshot.dataset_revision)}</code></li><li><strong>Measured framework:</strong> ${[...new Set(runs.map(r=>`${r.backend} ${r.measured_backend_version}`))].map(esc).join("; ")}</li><li><strong>Prediction database:</strong> ${[...new Set(runs.map(r=>`${r.backend} ${r.prediction_backend_version||"unavailable"}`))].map(esc).join("; ")}</li><li><strong>Evaluated:</strong> ${esc(snapshot.completed_at)}${snapshot.preview?" · Preview":""}${snapshot.measurement_campaign_status==="partial"?" · Partial silicon campaign; dataset remains unscored and ineligible for promotion.":""}</li><li><strong>Wheel SHA256:</strong> <code>${esc(snapshot.wheel_sha256)}</code></li>${[...new Map(runs.flatMap(r=>(r.op_data||[]).map(d=>[d.file,d]))).values()].map(d=>`<li>${githubIcon} <strong>Op data:</strong> <a href="https://github.com/ai-dynamo/aisim/blob/${esc(snapshot.commit_sha)}/python/aisim/src/aisim_core/systems/data/${esc(d.file)}">${esc(d.file)}</a><br><code>${esc(d.sha256)}</code></li>`).join("")}</ul>`;
  }
  function coverageEvidence(point) {
    const exclusions={};
    point.pairs.filter(p=>p.status!=="matched").forEach(p=>exclusions[p.status]=(exclusions[p.status]||0)+1);
    const labels={measurement_cancelled:"Cancelled without a request record"};
    const detail=Object.entries(exclusions).map(([status,count])=>`${esc(labels[status]||status.replaceAll("_"," "))}: ${count.toLocaleString()}`).join("; ")||"None";
    return `<ul class="agentx-notes"><li><strong>Request coverage:</strong> ${point.coverage.matched.toLocaleString()} / ${point.coverage.measured.toLocaleString()} matched. TTFT denominator: ${point.request_errors.ttft_ms.count.toLocaleString()}; TPOT denominator: ${point.request_errors.tpot_ms.count.toLocaleString()}.</li><li><strong>Excluded requests:</strong> ${detail}. Missing intervals remain unavailable.</li></ul>`;
  }
  function simulationEvidence(point) {
    const record=point.simulation_features;
    if(!record)return '<h2>AISim effective feature settings</h2><p>Legacy missing evidence. Re-execute with the evaluated wheel to record resolved settings; current defaults are not applied to historical runs.</p>';
    return `<h2>AISim effective feature settings</h2><p>Recorded in GitHub CI after defaults and compilation. Configured enabled does not establish observed use.</p><p>Evaluated AISim revision: <code>${esc(record.evaluated_revision)}</code><br>Silicon dataset revision: <code>${esc(record.dataset_revision)}</code><br>Resolved configuration SHA256: <code>${esc(record.configuration_sha256||"Unavailable")}</code></p>${record.roles.map(role=>`<h3>${esc(role.role)} · ${esc(role.model)} · ${esc(role.backend)} ${esc(role.backend_version||"Unavailable")}</h3><div class="table-scroll"><table><thead><tr><th>Feature</th><th>Configured state</th><th>Effective parameters</th><th>Observed use</th></tr></thead><tbody>${role.features.map(row=>`<tr><th>${esc(row.id)}</th><td>${esc(row.state.replaceAll("_"," "))}</td><td>${esc(JSON.stringify(row.parameters))}</td><td>${esc(row.observed.state.replaceAll("_"," "))}</td></tr>`).join("")}</tbody></table></div>`).join("")}`;
  }
  function featureEvidence(point) {
    const record=point.feature_metadata;
    if(!record) return '<h2>Silicon features</h2><p>Feature record unavailable for this historical measurement.</p>';
    return `<h2>Silicon features · HF dataset record</h2><p>Measured settings are saved with the silicon dataset. Enabled does not imply exercised. <a href="../../feature-support-matrix/#agentx">Feature support matrix ↗</a></p><p>🤗 <strong>Feature metadata dataset revision:</strong> <code>${esc(point.feature_dataset_revision||point.snapshot.dataset_revision)}</code>${point.feature_dataset_revision?" · Supplemental evidence; the evaluated dataset revision is unchanged.":""}</p><p>Feature taxonomy · AISim repository commit · <a href="https://github.com/ai-dynamo/aisim/blob/${esc(record.taxonomy?.revision||"Unrecorded")}/pages/feature-support-matrix/features.toml"><code>${esc(record.taxonomy?.revision||"Unrecorded")}</code></a></p><div class="table-scroll"><table><thead><tr><th>Feature</th><th>Measured state</th><th>Parameters</th><th>Observed use</th></tr></thead><tbody>${record.features.map(f=>`<tr><th>${esc(f.id.replaceAll("."," · ").replaceAll("_"," "))}</th><td>${esc(f.state.replaceAll("unknown","unrecorded").replaceAll("_"," "))}</td><td>${f.parameters.map(p=>`${esc(p.name)}: ${esc(p.value??"unrecorded")}`).join("; ")||"—"}</td><td>${esc(f.observed.state.replaceAll("unknown","unrecorded").replaceAll("_"," "))}${f.observed.count===null?"":` · ${f.observed.count}`}</td></tr>`).join("")}</tbody></table></div>`;
  }
  async function detail() {
    const root=document.getElementById("agentx-point"), params=new URL(location.href).searchParams, branch=params.get("branch")||"main";
    let renderer;
    try {
      const catalog=await json("./branches.json"), branchSelect=document.getElementById("branch-select");
      branchSelect.innerHTML=catalog.branches.map(e=>`<option value="${esc(e.branch)}">${esc(e.branch)}</option>`).join("");
      branchSelect.value=branch;branchSelect.disabled=false;
      branchSelect.addEventListener("change",()=>{const url=new URL(location.href);url.searchParams.set("branch",branchSelect.value);location.href=url;});
      const backParams=new URLSearchParams({tab:"agentx",branch});
      if(params.get("campaign"))backParams.set("campaign",params.get("campaign"));
      document.getElementById("back").href=`../?${backParams}`;
      const loaded=await summary(branch,"./");
      if(!loaded) throw new Error("No AgentX evidence is available for this branch.");
      if(!params.has("campaign") && params.get("category")==="self_collected" && ["length","cache","repeat"].some(k=>params.has(k)) && loaded.data.runs.some(r=>r.category==="self_collected"&&r.boundary==="successful_profile_span")) {
        const archived=new URL(location.href);archived.searchParams.set("campaign","finite-v1");location.replace(archived);return;
      }
      const runs=loaded.data.runs.filter(r=>r.category===params.get("category") && r.model===params.get("model") && r.lanes===Number(params.get("lanes")) && (!params.get("perf") || estimationOf(r)===params.get("perf")));
      if(!runs.length) throw new Error("This concurrency was not evaluated.");
      const first=runs[0];
      document.getElementById("point-title").textContent=`${first.model} · ${first.lanes} lane${first.lanes===1?"":"s"} · ${performanceModel([first],true)}`;
      root.innerHTML=`<p class="agentx-identity"><span class="source-tag">${first.category==="agentx"?"AgentX official":"Self-collected"}</span> ${esc(first.hardware)} · ${esc(first.backend)} · ${esc(first.precision)} · TP${first.tensor_parallel} · ${source(first)}</p><div id="variant-controls" class="filter-toolbar"></div><p id="selected-run-label" class="evidence-brief"></p><div id="selected-run"></div>`;
      const controls=document.getElementById("variant-controls");
      if(params.get("campaign")==="finite-v1")root.insertAdjacentHTML("afterbegin",'<p class="evidence-brief">Archived finite campaign · historical measurements and predictions.</p>');
      const finite=first.boundary==="complete_finite_cohort";
      controls.hidden=!finite;
      if(finite) {
        controls.innerHTML=`<label>Initial prompt<select id="length"><option value="4096">4K</option><option value="32768">32K</option></select></label><label>Initial cache<select id="cache"><option value="cold">Cold</option><option value="warm">Warm</option></select></label><label>Repeat<select id="repeat"><option>0</option><option>1</option><option>2</option></select></label>`;
        for(const [key,fallback] of [["length","4096"],["cache","cold"],["repeat","0"]]) {
          const select=document.getElementById(key),value=params.get(key)||fallback;select.value=[...select.options].some(o=>o.value===value)?value:fallback;
        }
      }
      document.getElementById("selected-run").textContent="Loading concurrency measurements…";
      const [fragment,points,featureData]=await Promise.all([
        fetch("./dashboard-body.html", {cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error("Replay assets unavailable.");return r.text();}),
        Promise.all(runs.map(async run=>{
          if(!/^details\/[a-z0-9-]+\.json$/.test(run.detail_path))throw new Error("Invalid detail path.");
          const point=await json(loaded.base+run.detail_path);
          if(point.id!==run.id||JSON.stringify(point.snapshot)!==JSON.stringify(loaded.data.snapshot)||JSON.stringify(point.request_errors)!==JSON.stringify(run.request_errors))throw new Error("Point provenance or request summary mismatch.");
          return point;
        })),
        loadFeatureEvidence(loaded),
      ]);
      const group=aggregate(points);
      async function select() {
        const length=document.getElementById("length")?.value,cache=document.getElementById("cache")?.value,repeat=document.getElementById("repeat")?.value;
        const run=!finite?first:runs.find(r=>r.initial_input_tokens===Number(length)&&r.cache_state===cache&&r.repeat===Number(repeat));
        if(!run)throw new Error("Selected workload is unavailable.");
        const url=new URL(location.href);if(length)for(const [key,value] of Object.entries({length,cache,repeat}))url.searchParams.set(key,value);history.replaceState(null,"",url);
        const target=document.getElementById("selected-run");renderer?.destroy();target.innerHTML='<p role="status">Loading selected run…</p>';
        const measured=points.find(p=>p.id===run.id),record=featureData?.records.find(r=>r.benchmark_id===run.id);
        const point=record?{...measured,feature_metadata:record.feature_metadata,feature_dataset_revision:featureData.feature_dataset_revision}:measured;
        document.getElementById("selected-run-label").textContent=`Selected run · ${!finite?"Observed outputs · Weka profile":`${Number(length).toLocaleString()} tokens · ${cache} · repeat ${repeat}`} · ${point.outcome}${point.reason?" · "+point.reason.replaceAll("_"," "):""}${point.snapshot.measurement_campaign_status==="partial"?" · Partial silicon campaign · unscored dataset; not eligible for promotion":""}`;
        const lanes=`${first.lanes} lane${first.lanes===1?"":"s"}`;
        const accuracy=`<div class="agentx-summary-layout">${featureChecklist(point)}<section class="agentx-summary-main"><h2>Concurrency summary</h2><p>${runs.length>1?"All ":""}${runs.length} run${runs.length===1?"":"s"} · ${lanes} · ${group.coverage.matched.toLocaleString()} / ${group.coverage.measured.toLocaleString()} requests matched · ${esc(performanceModel(points))}</p><div class="table-scroll"><table class="agentx-summary-table"><thead><tr><th scope="col">Metric</th><th scope="col"><span class="comparison-source-dot silicon" aria-hidden="true"></span>Silicon</th><th scope="col"><span class="comparison-source-dot aisim" aria-hidden="true"></span>AISim</th><th scope="col">Error</th><th scope="col" class="agentx-samples">Samples</th></tr></thead><tbody>${comparisonRows(group)}</tbody></table></div><p class="agentx-summary-note">Point rows: silicon vs AISim point values for reference.</p>${metricsTable(points)}</section></div>`;
        const evidence=`<h2>Metrics and provenance</h2>${methodology()}${coverageEvidence(point)}${provenance(point.snapshot,[point])}${featureEvidence(point)}${simulationEvidence(point)}<h2>AISim replay configuration</h2><ul>${point.config_summary.map(item=>`<li><strong>${esc(item.name)}:</strong> ${esc(item.value??"Unavailable")}</li>`).join("")}</ul><h2>Sources and limitations</h2><ul><li>${source(point)}</li><li>${point.boundary==="complete_finite_cohort"?"Finite measured cohort, including between-turn delays.":"Fixed profiling admission window; silicon and replay may progress through different requests."}</li><li>Request comparison requires a unique successful match and equal output lengths. Source identity does not establish identical prompts or cache history.</li><li>Curve MAPE uses covered, positive silicon observations on a one-second phase grid. Curve smoothing is described per chart. Zero and missing values are counted; preparation remains unscored.</li><li>Accuracy is advisory. No timing calibration is applied.</li></ul>`;
        target.innerHTML=`<div class="replay-dashboard embedded ${document.documentElement.dataset.theme==="light"?"light":""}">${fragment}</div>`;
        const state=new URLSearchParams(location.hash.slice(1)),view=state.get("view"),stage=state.get("stage")==="preparation"?"preparation":"profile";
        const report=point.report||{metadata:{},prediction:{},telemetry:{completion_status:point.outcome},phases:{profile:{}},requests:[],samples:[],lifecycle:[]};
        report.reference={pairs:point.pairs};
        renderer=AISimReplay.mount(target.firstElementChild,report,{accuracy,evidence,scoring:point.outcome==="completed",view:["timeline","evidence"].includes(view)?view:"dashboard",stage,
          onState:s=>{const u=new URL(location.href);u.hash=new URLSearchParams({view:s.view==="dashboard"?"point":s.view,stage:s.stage,variant:"observed"});history.replaceState(null,"",u);}});
      }
      controls.addEventListener("change",()=>select().catch(e=>document.getElementById("selected-run").textContent=e.message));
      window.addEventListener("aisim-theme",()=>renderer?.render());
      window.addEventListener("hashchange",()=>{if(!renderer)return;const hash=new URLSearchParams(location.hash.slice(1));renderer.state.view=["timeline","evidence"].includes(hash.get("view"))?hash.get("view"):"dashboard";renderer.state.stage=hash.get("stage")==="preparation"?"preparation":"profile";renderer.render();});
      await select();
    }catch(error){root.innerHTML=`<p role="alert">${esc(error.message)}</p>`;}
  }
  return {load,detail,aggregate,performanceModel,requestAggregate,stepAggregate,featureChecklist,validateFeatureEvidence};
})();
