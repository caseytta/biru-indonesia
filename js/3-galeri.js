(function () {
  const PER_PAGE = 12;
  let currentPage = 1;
  const active = { aplikasi: new Set(), segment: new Set(), brand: new Set() };
 
  const sidebar = document.getElementById("galFilters");
  const grid    = document.getElementById("galGrid");
  const pager   = document.getElementById("galPager");
  const countEl = document.getElementById("galCount");
  const emptyEl = document.getElementById("galEmpty");
  if (!grid) return;

  function buildSidebar() {
    const groupHtml = (key, label, items) => {
      const opts = items.map(v => `
        <label class="gal-opt">
          <input type="checkbox" data-group="${key}" value="${v.replace(/"/g,'&quot;')}" />
          <span>${v}</span>
        </label>`).join("");
      return `
        <div class="gal-group" data-group="${key}">
          <button type="button" class="gal-group__head">${label}</button>
          <div class="gal-group__body">${opts}</div>
        </div>`;
    };
 
    sidebar.innerHTML =
      groupHtml("aplikasi", "Solusi / Aplikasi", APLIKASI) +
      groupHtml("segment",  "Product Segment",   SEGMENTS) +
      `<div class="gal-group gal-group--brand" data-group="brand" id="galBrandGroup" style="display:none">
         <button type="button" class="gal-group__head">Brand</button>
         <div class="gal-group__body" id="galBrandBody"></div>
       </div>` +
      `<button type="button" class="gal-clear" id="galClear">Reset filter</button>`;
 
    sidebar.querySelectorAll('input[data-group="aplikasi"], input[data-group="segment"]').forEach(cb => {
      cb.addEventListener("change", () => {
        const grp = cb.dataset.group;
        cb.checked ? active[grp].add(cb.value) : active[grp].delete(cb.value);
        if (grp === "segment") onSegmentChange(cb.value, cb.checked);
        currentPage = 1; syncHash(); render();
      });
    });
 
    sidebar.querySelector("#galClear").addEventListener("click", resetAll);
  }
 
  function onSegmentChange(segment, checked) {
    if (!checked) {
      (BRAND_BY_SEGMENT[segment] || []).forEach(b => active.brand.delete(b));
    }
    renderBrandGroup();
  }
 
  function renderBrandGroup() {
    const group = document.getElementById("galBrandGroup");
    const body  = document.getElementById("galBrandBody");
 
    const segs = [...active.segment];
    if (segs.length === 0) {
      group.style.display = "none";
      body.innerHTML = "";
      return;
    }
 
    const seen = new Set();
    const html = segs.map(seg => {
      const brands = (BRAND_BY_SEGMENT[seg] || []).filter(b => !seen.has(b) && seen.add(b));
      if (!brands.length) return "";
      const opts = brands.map(b => `
        <label class="gal-opt">
          <input type="checkbox" data-group="brand" value="${b.replace(/"/g,'&quot;')}" ${active.brand.has(b) ? "checked" : ""} />
          <span>${b}</span>
        </label>`).join("");
      const sub = segs.length > 1 ? `<p class="gal-brand-sub">${seg}</p>` : "";
      return sub + opts;
    }).join("");
 
    body.innerHTML = html;
    group.style.display = "";
 
    body.querySelectorAll('input[data-group="brand"]').forEach(cb => {
      cb.addEventListener("change", () => {
        cb.checked ? active.brand.add(cb.value) : active.brand.delete(cb.value);
        currentPage = 1; syncHash(); render();
      });
    });
  }
 
  function resetAll() {
    Object.values(active).forEach(s => s.clear());
    sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    renderBrandGroup();
    currentPage = 1; syncHash(); render();
  }
 
  function valList(p, key) { return String(p[key] || "").split(",").map(s => s.trim()).filter(Boolean); }
  function matches(p) {
    for (const key of ["aplikasi", "segment", "brand"]) {
      const set = active[key];
      if (set.size === 0) continue;
      const vals = valList(p, key);
      if (!vals.some(v => set.has(v))) return false;
    }
    return true;
  }
 
  function render() {
    const filtered = PROJECTS.filter(matches);
    countEl.textContent = `${filtered.length} proyek`;
 
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = filtered.slice(start, start + PER_PAGE);
 
    emptyEl.style.display = filtered.length ? "none" : "block";
 
    grid.innerHTML = pageItems.map(p => {
      const segs = valList(p, "segment");
      const brands = valList(p, "brand");
      let url = null;
      if (brands.length === 1) url = brandUrlFor(segs[0], brands[0]);
      const tag = url ? "a" : "div";
      const href = url ? `href="${url}"` : "";
      const segBadges = segs.map(s => `<span class="gal-card__seg">${s}</span>`).join("");
      return `
        <${tag} class="gal-card" ${href}>
          <div class="gal-card__img">
            <img src="${p.img}" alt="${p.nama}" loading="lazy" />
            <div class="gal-card__segs">${segBadges}</div>
          </div>
          <div class="gal-card__body">
            <h3 class="gal-card__title">${p.nama}</h3>
            <p class="gal-card__meta">${brands.join(", ")} &middot; ${valList(p,"aplikasi").join(", ")}${p.tahun ? " &middot; " + p.tahun : ""}</p>
          </div>
        </${tag}>`;
    }).join("");
 
    renderPager(totalPages);
  }
 
  function renderPager(totalPages) {
    if (totalPages <= 1) { pager.innerHTML = ""; return; }
    let html = `<button class="gal-page__btn" data-page="prev" ${currentPage===1?"disabled":""}>&#8592;</button>`;
    for (let i=1;i<=totalPages;i++) html += `<button class="gal-page__btn${i===currentPage?" is-active":""}" data-page="${i}">${i}</button>`;
    html += `<button class="gal-page__btn" data-page="next" ${currentPage===totalPages?"disabled":""}>&#8594;</button>`;
    pager.innerHTML = html;
    pager.querySelectorAll(".gal-page__btn").forEach(b => b.addEventListener("click", () => {
      const v=b.dataset.page;
      if(v==="prev")currentPage--; else if(v==="next")currentPage++; else currentPage=+v;
      render();
      document.getElementById("galTop").scrollIntoView({behavior:"smooth",block:"start"});
    }));
  }
 
  function syncHash() {
    const parts = [];
    for (const key of ["aplikasi","segment","brand"])
      if (active[key].size) parts.push(`${key}=${[...active[key]].map(encodeURIComponent).join(",")}`);
    history.replaceState(null,"",location.pathname+location.search+(parts.length?"#!"+parts.join("&"):""));
  }
  function readHash() {
    const h = location.hash.replace(/^#!?/,"");
    if (!h) return;
    h.split("&").forEach(pair => {
      const [k,v] = pair.split("=");
      if (active[k] && v) v.split(",").forEach(x => active[k].add(decodeURIComponent(x)));
    });

    sidebar.querySelectorAll('input[data-group="aplikasi"], input[data-group="segment"]').forEach(cb => {
      if (active[cb.dataset.group].has(cb.value)) cb.checked = true;
    });
    renderBrandGroup();
  }
 
  buildSidebar();
  readHash();
  render();
})();
 