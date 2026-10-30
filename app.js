const app = document.getElementById("app");
const nav = document.getElementById("nav");

const CATEGORIES = [
  { slug: "denim", label: "Denim" },
  { slug: "shirts", label: "Shirts" },
  { slug: "jackets", label: "Jackets" },
  { slug: "cargos", label: "Cargos" },
  { slug: "pants", label: "Pants" },
];


const IMG = {
  hero: "/assets/About3-B9cmU6sk.png",
  denim: "/assets/hulk-32003-mid-blue-model-Cn1adhjB.jpg",
  jackets: "/assets/home-banner-denim-jacket-DXU6Lkz3.jpg",
  shirts: "/assets/home-banner-corduroy-shirt-D0wu1r0K.jpg",
  craft: "/assets/About1-C60kMP7t.png",
  about: "/assets/denim-banner-rock-Dh8R2dSg.jpg",
  contact: "/assets/denim-banner-hulk-BLGnSwTZ.jpg",
};

let products = [];
const byHandle = new Map();

const inr = (n) => "₹" + n.toLocaleString("en-IN");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Lead with the model shot when there is one; the flat shot becomes the hover image.
function cardImages(p) {
  if (p.images[0] && p.images[0].includes("-model")) {
    const alt = p.images.find((i) => !i.includes("-model")) || p.images[1] || p.images[0];
    return [p.images[0], alt];
  }
  const model = p.images.find((i) => /-model-(?!back)/.test(i));
  const front = p.images[0];
  return model ? [model, front] : [front, p.images[1]];
}

function colorOf(p) {
  return p.color || p.name.split("—").pop().trim();
}

function card(p) {
  const [main, alt] = cardImages(p);
  const flat = !p.images.some((i) => i.includes("-model"));
  const isModel = Boolean(main && main.includes("-model"));
  return `
    <a class="card rv" href="/product/${p.handle}" data-link>
      <div class="card-media${flat ? " flat" : ""}">
        <img src="${main}" class="${isModel ? "img-model" : ""}" alt="${esc(p.name)}" loading="lazy" />
        ${alt ? `<img class="alt" src="${alt}" alt="" loading="lazy" />` : ""}
      </div>
      <div class="card-meta">
        <div>
          <div class="card-name">${esc(p.type)}</div>
          <div class="card-sub">${esc(colorOf(p))}</div>
        </div>
        <div>${inr(p.price)}</div>
      </div>
    </a>`;
}

/* ---------- Views ---------- */

const FITS = [
  { type: "Hulk", fit: "Super baggy", line: "Take up space.", handle: "hulk-32003-mid-blue" },
  { type: "Rock", fit: "Baggy", line: "Low-key loud.", handle: "rock-166-raw-wash" },
  { type: "Jazz", fit: "Comfort", line: "The everyday leg.", handle: "jazz-3178-ice-berg" },
  { type: "Brawny", fit: "Straight", line: "Clean and classic.", handle: "brawny-5462-navy" },
];

const ERAS = [
  { slug: "denim", img: "/assets/hulk-32003-mid-blue-model-Cn1adhjB.jpg" },
  { slug: "shirts", img: "/assets/home-banner-corduroy-shirt-D0wu1r0K.jpg" },
  { slug: "jackets", img: "/assets/home-banner-denim-jacket-DXU6Lkz3.jpg" },
  { slug: "cargos", img: "/assets/comfort-cargo-9018-olive-front-Cdhnqrc5.jpg" },
  { slug: "pants", img: "/assets/light-weight-pant-4035-navy-front.jpg?v=2" },
];

// Lookbook, as on the original site: model in the middle, pieces pinned left and right.
const LOOKS = [
  {
    title: "Corduroy shirt in washed sand, worn open over relaxed denim.",
    notes: ["98% cotton corduroy with 2% spandex, so it softens without losing its shape.", "Hulk cuts a super-baggy leg in 100% cotton, left long at the ankle.", "Layers just as easily over a plain tee on warmer days."],
    model: "/assets/Model1-S7237FFC.png",
    alt: "Model wearing a tan corduroy shirt and wide-leg jeans",
    top: { img: "/assets/model1-shirt-MWOwp_ms.png", label: "The Shirt", handle: "corduroy-shirt-0041-beige", line: { x1: -24, y1: 74, x2: 112, y2: 66 } },
    bottom: { img: "/assets/model1-jeans-C6SvdIEG.png", label: "The Denim", handle: "hulk-32003-mid-blue", line: { x1: 224, y1: 200, x2: 116, y2: 178 } },
  },
  {
    title: "Fur-lined corduroy trucker layered over black wash denim.",
    notes: ["Corduroy trucker lined in fur, cut in 98% cotton with 2% spandex.", "Jazz runs a comfort leg in 99% cotton with 1% elastane.", "Both pieces run S–4XL and waist 30–44 respectively."],
    model: "/assets/model2-6q9cesFV.png",
    alt: "Model wearing a shearling-collar corduroy trucker jacket and black jeans",
    top: { img: "/assets/model2-shirt-B32Rz7q_.png", label: "The Jacket", handle: "corduroy-jacket-173-brown", line: { x1: -24, y1: 76, x2: 80, y2: 79 } },
    bottom: { img: "/assets/model2-jeans-CiN8G4mL.png", label: "The Denim", handle: "jazz-3190-black", line: { x1: 224, y1: 200, x2: 118, y2: 178 } },
  },
];
let lookIndex = 0;

const plus = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;
const tick = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
const chev = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${d}"/></svg>`;

function lookDetail(item, side) {
  const p = byHandle.get(item.handle);
  return `
    <div class="stl-detail-cell stl-detail-cell-${side}">
      <div class="stl-detail-card">
        <a href="/product/${p.handle}" class="stl-detail-img" data-link><span class="stl-detail-tag">${item.label}</span><img src="${item.img}" alt="${esc(p.name)}" /></a>
        <div class="stl-detail-body">
          <a href="/product/${p.handle}" class="stl-detail-name" data-link>${esc(p.name)}</a>
          <div class="stl-detail-footer">
            <span class="stl-detail-price">${inr(p.price)}</span>
            <button type="button" class="stl-detail-add" data-add="${p.handle}">${plus} Add</button>
          </div>
        </div>
      </div>
    </div>`;
}

function lookbook() {
  const L = LOOKS[lookIndex];
  const t = L.top.line, b = L.bottom.line;
  const pieces = [L.top, L.bottom].map((i) => byHandle.get(i.handle));
  const pad = (n) => String(n).padStart(2, "0");
  return `
    <div class="stl-look-bar">
      <div class="stl-look-meta">
        <span class="stl-look-count">Look ${pad(lookIndex + 1)}<em> / ${pad(LOOKS.length)}</em></span>
        <p class="stl-look-title">${esc(L.title)}</p>
        <ul class="stl-look-notes">${L.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
      </div>
      <div class="stl-look-nav">
        <button type="button" data-look="-1" aria-label="Previous look">${chev("M15 18l-6-6 6-6")}</button>
        <button type="button" data-look="1" aria-label="Next look">${chev("M9 18l6-6-6-6")}</button>
      </div>
    </div>
    <div class="stl-anatomy-cell" id="lookCell">
      <div class="stl-anatomy-stage">
        <img class="stl-anatomy-model" src="${L.model}" alt="${esc(L.alt)}" />
        <svg class="stl-anatomy-lines" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
          <line class="stl-line-l" x1="${t.x1}" y1="${t.y1}" x2="${t.x2}" y2="${t.y2}" />
          <circle class="stl-halo stl-dot-l" cx="${t.x2}" cy="${t.y2}" r="6" /><circle class="stl-dot-l" cx="${t.x2}" cy="${t.y2}" r="2.6" />
          <line class="stl-line-r" x1="${b.x1}" y1="${b.y1}" x2="${b.x2}" y2="${b.y2}" />
          <circle class="stl-halo stl-dot-r" cx="${b.x2}" cy="${b.y2}" r="6" /><circle class="stl-dot-r" cx="${b.x2}" cy="${b.y2}" r="2.6" />
        </svg>
        ${lookDetail(L.top, "l")}
        ${lookDetail(L.bottom, "r")}
      </div>
    </div>
    <div class="stl-look-total">
      <div class="stl-look-total-info">
        <span class="stl-look-total-label">Complete the look</span>
        <span class="stl-look-total-sum">${pieces.length} pieces <i aria-hidden="true">·</i> ${inr(pieces.reduce((n, p) => n + p.price, 0))}</span>
      </div>
      <button type="button" class="stl-look-total-add" data-add-all="${pieces.map((p) => p.handle).join(",")}">Add both to bag ${arrow}</button>
    </div>`;
}

// "Explore the edit" rows on the homepage.
const EDIT = [
  { slug: "denim", line: "Six fits, straight to super baggy — Hulk, Rock, Jazz, Brawny and more." },
  { slug: "shirts", line: "Corduroy and denim shirts, some lined with fleece for winter." },
  { slug: "jackets", line: "Denim and corduroy truckers, a few with fur and fleece." },
  { slug: "cargos", line: "Comfort-fit cargos in 100% cotton, pockets down the leg." },
  { slug: "pants", line: "Light, heavy and comfort weights for every day." },
];
const pad2 = (n) => String(n).padStart(2, "0");

const arrow = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`;

function head(index, title, blurb, cta, to) {
  return `
    <div class="hr-head">
      <div class="hr-head-main rv"><h2 class="hr-head-title">${title}</h2></div>
      <div class="hr-head-aside rv">
        ${blurb ? `<p class="hr-head-blurb">${blurb}</p>` : ""}
        ${cta ? `<a href="${to}" class="hr-head-link" data-link>${cta} ${arrow.replace('width="16" height="16"', 'width="14" height="14"')}</a>` : ""}
      </div>
    </div>`;
}

function home() {
  const fitCount = (t) => products.filter((p) => p.type === t).length;
  const ticker = ["Free Shipping Over ₹2,999", "Cut &amp; Sewn In Delhi", "15-Day Easy Returns", "Rope-Dyed Indigo", "Est. 2006"]
    .map((t) => `<span class="hr-marquee-item">${t}<span class="hr-marquee-dot" aria-hidden="true">✦</span></span>`).join("");
  return `
    <section class="hr-hero" aria-label="Vintage Blue heritage denim">
      <div class="hr-hero-inner">
        <img class="hr-hero-bg" data-par="0.12" src="/assets/herobg-D_9V6R5T.png" alt="" aria-hidden="true" />
        <div class="hr-hero-scrim"></div>
        <h1 class="hr-wordmark" data-par="0.16" data-fade><span class="script-initial">V</span>intage Blue</h1>
        <img class="hr-cutout" data-par="-0.035" src="/assets/herocutout-dgNe446d.png" alt="Model wearing a shearling-collar denim jacket over dark wash jeans" />
        <div class="hr-hero-copy">
          <p class="hr-eyebrow">Denim With Lore</p>
          <a href="/shop" class="hr-cta" data-link>Shop The Collection ${arrow}</a>
        </div>
      </div>
    </section>

    <div class="hr-marquee" aria-hidden="true"><div class="hr-marquee-track">${ticker}${ticker}</div></div>

    <section class="hr-wrap" id="hr-categories">
      <div class="k-split">
        <div class="k-left rv">
          <p class="k-eyebrow"><i></i>The Collection</p>
          <h2>Explore<br /><span>the edit.</span></h2>
          <a class="k-link" href="/shop" data-link>Browse everything ${arrow.replace('width="16" height="16"', 'width="13" height="13"')}</a>
        </div>
        <ol class="k-rows">
          ${EDIT.map((e, i) => {
            const n = products.filter((p) => p.categories.includes(e.slug)).length;
            const label = CATEGORIES.find((c) => c.slug === e.slug).label;
            return `<li class="rv"><a href="/shop/${e.slug}" data-link>
              <div class="k-body"><h3>${label}</h3><p>${e.line}</p></div>
              <span class="k-count">${n} pieces</span>
              <span class="k-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
            </a></li>`;
          }).join("")}
        </ol>
      </div>
    </section>

    <section class="hr-wrap">
      ${head("02", "Denim, Done Right.", "Four cuts, every wash. Rope-dyed indigo, cut and sewn in our own Delhi workshop.", "All Denim", "/shop/denim")}
      <div class="fits">
        ${FITS.map((f) => {
          const p = byHandle.get(f.handle);
          return `
          <a class="fit rv" href="/shop/denim?type=${encodeURIComponent(f.type)}" data-link>
            <div class="fit-media"><img src="${cardImages(p)[0]}" alt="Model in ${esc(f.type)} jeans" loading="lazy" /></div>
            <div class="fit-meta">
              <span class="fit-name">${esc(f.type)}</span>
              <span class="fit-sub">${f.fit} · ${fitCount(f.type)} washes</span>
            </div>
            <p class="fit-line">${f.line}</p>
          </a>`;
        }).join("")}
      </div>
    </section>

    <section class="hr-weekend">
      <video class="hr-weekend-bg" data-par-rel="0.14" src="/assets/video-weekend-hd.mp4" autoplay muted loop playsinline poster="/assets/video-weekend-poster.jpg" aria-hidden="true"></video>
      <div class="hr-weekend-panel"><ul class="hr-weekend-list hr-weekend-list-left">${["Truckers", "Overshirts", "Chore Coats", "Flannel", "Shearling"].map((t) => `<li>${t}</li>`).join("")}</ul></div>
      <div class="hr-weekend-panel"><ul class="hr-weekend-list hr-weekend-list-right">${["Straight Leg", "Wide Leg", "Selvedge", "Raw Denim"].map((t) => `<li>${t}</li>`).join("")}</ul></div>
      <div class="hr-weekend-title">
        <div class="rv">
          <p class="hr-weekend-eyebrow">Certified Off-Duty</p>
          <h2>Soft Launch Your Weekend</h2>
          <p class="hr-weekend-copy">Heavier washes, softer layers. The pieces that carry a Saturday from the porch to the road and back again.</p>
          <a href="/shop" class="hr-weekend-cta" data-link>Shop The Edit ${arrow}</a>
        </div>
      </div>
    </section>

    <section class="banners">
      <a class="banner rv" href="/shop/jackets" data-link>
        <img src="/assets/home-banner-denim-jacket-DXU6Lkz3.jpg" alt="Model lounging in a washed grey denim jacket" loading="lazy" />
        <div class="banner-copy">
          <p class="banner-eyebrow">The Denim Jacket</p>
          <h3>Main character energy.</h3>
          <span class="banner-cta">Shop jackets ${arrow}</span>
        </div>
      </a>
      <a class="banner rv" href="/shop/shirts" data-link>
        <img src="/assets/home-banner-corduroy-shirt-D0wu1r0K.jpg" alt="Model in a corduroy shirt in a vintage car" loading="lazy" />
        <div class="banner-copy">
          <p class="banner-eyebrow">The Corduroy Shirt</p>
          <h3>Effortless? Obviously.</h3>
          <span class="banner-cta">Shop shirts ${arrow}</span>
        </div>
      </a>
    </section>


    <section class="hr-wrap">
      ${head("03", "The Lookbook.", "Two looks, styled in-house. Tap a piece to shop it, or add the whole look.", "", "")}
      <div class="stl-anatomy" id="lookbook">${lookbook()}</div>
    </section>

    <section class="craft">
      <div class="craft-media rv"><img src="/assets/About2-2b59lb8O.png" alt="Model walking through a lit store aisle in relaxed denim" loading="lazy" /></div>
      <div class="rv">
        <p class="eyebrow">Behind the seams</p>
        <h2>Made in-house.<br />No middlemen,<br />no shortcuts.</h2>
        <p class="body">We started in 2006 as a denim label and never outsourced the part that matters. Indigo is rope-dyed at our sister mill, blocks are tested on real bodies across four cities, and every batch is checked twice before it ships.</p>
        <div class="stats">
          <div class="stat"><strong>2006</strong><span>Founded</span></div>
          <div class="stat"><strong>8</strong><span>States served</span></div>
          <div class="stat"><strong>100%</strong><span>Made in India</span></div>
        </div>
        <a class="link-line" href="/about" data-link>Read our story <span aria-hidden="true">→</span></a>
      </div>
    </section>`;
}

/* ---------- Home 2: clean grid layout (H&M-style) ---------- */

const NEW_IN = ["denim-shirt-0043-ice-berg", "corduroy-jacket-173-brown", "denim-fur-jacket-167-dark-blue", "jazz-3124-raw-wash", "corduroy-shirt-with-fleece-142-3-brown", "comfort-cargo-9018-olive", "denim-shirt-0024-dark-blue", "light-weight-pant-4035-navy"];
const go2 = `<svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M0 6h21M16 1l5 5-5 5"/></svg>`;

function home2() {
  const ticker = ["Free shipping over ₹2,999", "Cut &amp; sewn in Delhi", "15-day easy returns", "Rope-dyed indigo", "Est. 2006"]
    .map((t) => `<span>${t}</span><i aria-hidden="true">/</i>`).join("");
  const P = (h) => byHandle.get(h);
  const tile = (p, label) => {
    const [a, b] = cardImages(p);
    return `<a class="g-tile rv" href="/product/${p.handle}" data-link>
      <div class="g-img"><img src="${a}" alt="${esc(p.name)}" loading="lazy" />${b ? `<img class="g-alt" src="${b}" alt="" loading="lazy" />` : ""}</div>
      <p class="g-name">${esc(label || p.name)}</p>
      <p class="g-price">${inr(p.price)}</p>
    </a>`;
  };
  const bar = (text, to) => `<a class="g-bar" href="${to}" data-link><span>${text}</span>${go2}</a>`;

  return `
    <section class="h2-hero" aria-label="Vintage Blue Winter 2026">
      <div class="h2-frame">
        <img src="/assets/ref/brick4k.jpg?v=2" alt="Model in a dark denim trucker and washed cargo jeans sitting on the hood of a black vintage car" />
        <p class="h2-word" aria-hidden="true">JOYRIDE</p>
        <img class="h2-fg" src="/assets/ref/brick4k-layer.png?v=2" alt="" aria-hidden="true" />
      </div>
      <div class="h2-safe">
        <div class="h2-t h2-row"><span>The '70s trucker,<br />cut for now</span><span>Winter<br />2026</span><span>Vintage<br />Blue</span></div>
        <div class="h2-t" style="left: 3.2%; bottom: 6%">Rinse trucker <i>· ₹3,499</i><br />Washed cargo jean <i>· ₹2,499</i></div>
        <a class="h2-t h2-shop" href="/shop" data-link style="right: 3.2%; bottom: 6%"><span class="sq"></span>Shop<br />now<span class="bar"></span></a>
      </div>
    </section>

    <div class="h2-ticker" aria-hidden="true"><div class="h2-ticker-track">${ticker}${ticker}${ticker}</div></div>

    <section class="g-sec g-words-sec">
      <div class="g-words-top rv"><span>Shop by category</span><span>${products.length} pieces</span></div>
      <nav class="g-words" aria-label="Categories">
        ${EDIT.map((e) => {
          const n = products.filter((p) => p.categories.includes(e.slug)).length;
          const label = CATEGORIES.find((c) => c.slug === e.slug).label;
          return `<a class="rv" href="/shop/${e.slug}" data-link>${label}<sup>${n}</sup></a>`;
        }).join("")}
      </nav>
    </section>

    <section class="g-sec">
      <div class="g-head rv"><h2 class="g-title">Denim, by fit</h2><a href="/shop/denim" data-link>See more</a></div>
      <div class="g-box rv">
        ${[["hulk-32003-mid-blue", "Hulk Super Baggy", "hulk"], ["rock-163-dark-navy", "Rock Baggy", "rock"], ["jazz-3214-mid-blue", "Jazz Comfort", "jazz"], ["brawny-5462-navy", "Brawny Straight", "brawny"]].map(([h, label, pic]) => {
          const p = P(h);
          return `<a class="g-box-cell" href="/shop/denim?type=${encodeURIComponent(p.type)}" data-link>
            <div class="g-box-img"><img src="/assets/fits/${pic}.png?v=2" alt="Model in ${esc(label)} jeans" loading="lazy" /></div>
            <div class="g-box-cap"><span>${label}</span>${go2}</div>
          </a>`;
        }).join("")}
      </div>
    </section>

    <section class="hr-weekend h2-weekend">
      <video class="hr-weekend-bg" data-par-rel="0.14" src="/assets/video-weekend-hd.mp4" autoplay muted loop playsinline poster="/assets/video-weekend-poster.jpg" aria-hidden="true"></video>
      <div class="hr-weekend-panel"><ul class="hr-weekend-list hr-weekend-list-left">${["Truckers", "Overshirts", "Chore Coats", "Flannel", "Shearling"].map((t) => `<li>${t}</li>`).join("")}</ul></div>
      <div class="hr-weekend-panel"><ul class="hr-weekend-list hr-weekend-list-right">${["Straight Leg", "Wide Leg", "Selvedge", "Raw Denim"].map((t) => `<li>${t}</li>`).join("")}</ul></div>
      <div class="hr-weekend-title">
        <div class="rv">
          <p class="hr-weekend-eyebrow">Certified Off-Duty</p>
          <h2>Soft Launch Your Weekend</h2>
          <p class="hr-weekend-copy">Heavier washes, softer layers. The pieces that carry a Saturday from the porch to the road and back again.</p>
          <a href="/shop" class="hr-weekend-cta" data-link>Shop The Edit ${arrow}</a>
        </div>
      </div>
    </section>

    <section class="g-sec g-stag" aria-label="Jackets, shirts and pants">
      <a class="g-stag-col g-stag-1 rv" href="/shop/jackets" data-link>
        <p class="g-stag-note">Cropped and boxy,<br />cut a little short.<br /><span>Worn over ecru denim.</span></p>
        <div class="g-stag-img"><img src="/assets/editorial/suede-jacket.jpg" alt="Model in a cropped navy jacket and ecru jeans" loading="lazy" /></div>
        <div class="g-stag-cap"><span>Jackets</span><em>Shop</em></div>
      </a>
      <a class="g-stag-col g-stag-2 rv" href="/shop/shirts" data-link>
        <div class="g-stag-img"><img src="/assets/editorial/linen-stripe.jpg" alt="Model in a striped shirt with a knit over his shoulders" loading="lazy" /></div>
        <div class="g-stag-cap"><span>Shirts</span><em>Shop</em></div>
      </a>
      <a class="g-stag-col g-stag-3 rv" href="/shop/pants" data-link>
        <p class="g-stag-note">Pleated, relaxed,<br />made to move.<br /><span>Light and heavy weights.</span></p>
        <div class="g-stag-img"><img src="/assets/editorial/polo-pants.jpg" alt="Model in a cream polo and brown pleated pants" loading="lazy" /></div>
        <div class="g-stag-cap"><span>Pants</span><em>Shop</em></div>
      </a>
    </section>

    <section class="g-sec tm-look" id="lookbook" aria-label="Lookbook">
      <div class="tm-l rv">
        <p class="tm-k">The lookbook</p>
        <p class="tm-p">Winter 2026, shot in one afternoon. Washed black denim, a sherpa collar and ecru jeans cut wide — the colours we keep coming back to.</p>
        <a class="tm-link" href="/lookbook" data-link>Explore the lookbook</a>
      </div>
      <div class="tm-main rv"><img src="/assets/editorial/lb-seated.jpg" alt="Model in a black sherpa-collar denim jacket and ecru wide jeans, seated" loading="lazy" /></div>
      <div class="tm-side">
        <div class="tm-detail rv"><img src="/assets/editorial/lb-collar.jpg" alt="Close-up of the sherpa collar" loading="lazy" /><p>The collar</p></div>
        <div class="tm-detail rv"><img src="/assets/editorial/lb-pants.jpg" alt="Close-up of the ecru wide-leg jeans" loading="lazy" /><p>The leg</p></div>
      </div>
      ${(() => {
        const pieces = [P("denim-jacket-152-coal-grey"), P("brawny-5464-off-white")].filter(Boolean);
        const total = pieces.reduce((n, p) => n + p.price, 0);
        return `<div class="tm-shop rv">
          <p class="tm-k">Shop the look</p>
          <ul>${pieces.map((p) => `<li><a href="/product/${p.handle}" data-link><img src="${p.images.find((x) => x.includes("-front")) || p.images[0]}" alt="" loading="lazy" /><span>${esc(p.name)}</span></a><b>${inr(p.price)}</b><button type="button" data-add="${p.handle}" aria-label="Add ${esc(p.name)} to bag">${plus}</button></li>`).join("")}</ul>
          <button type="button" class="tm-btn" data-add-all="${pieces.map((p) => p.handle).join(",")}">Add both · ${inr(total)}</button>
        </div>`;
      })()}
    </section>`;
}

// Categories: show the picture for the hovered row.
function bindHome2() {
  const list = document.getElementById("h2Cats");
  if (!list) return;
  const imgs = document.querySelectorAll(".h2-cats-img img");
  list.querySelectorAll("li").forEach((li) => li.addEventListener("mouseenter", () => {
    list.querySelectorAll("li").forEach((x) => x.classList.toggle("on", x === li));
    imgs.forEach((im, k) => im.classList.toggle("on", k === +li.dataset.i));
  }));
}

/* ---------- About pages (v2 system): five layouts, same facts ---------- */
const ED = (n) => `/assets/editorial/${n}.jpg`;
const AB_NUMS = [["2006", "Founded in Delhi"], ["36 yrs", "Fabric sourcing"], ["08", "States served"], ["100%", "Made in India"]];
const AB_VALUES = [
  ["Authenticity", "No borrowed heritage — twenty years of our own patterns and our own mill."],
  ["Craftsmanship", "Stitch counts, seam finishing and hardware chosen to outlast the season."],
  ["Quality", "Every batch checked twice — once at the mill, once before it ships."],
];
const abImg = (src, alt = "", cls = "", pos = "50% 40%") => `<div class="ab-img ${cls}"><img src="${src}" alt="${alt}" loading="lazy" style="object-position:${pos}" /></div>`;
const abNums = () => `<div class="a2-nums">${AB_NUMS.map(([n, l]) => `<div class="rv"><b>${n}</b><span>${l}</span></div>`).join("")}</div>`;
const abValues = () => `<div class="a2-values">${AB_VALUES.map(([h, c]) => `<div class="rv"><h3>${h}</h3><p>${c}</p></div>`).join("")}</div>`;
const abSwitch = (n) => `<nav class="ab-switch" aria-label="About layouts">${[2, 3, 4, 5, 6, 7].map((k) => `<a href="/about${k}" data-link class="${k === n ? "on" : ""}">About ${k}</a>`).join("")}</nav>`;

// About 2 — statement, wide photo, story, numbers, process, values, closing.
function about2() {
  return `${abSwitch(2)}
    <section class="g-sec a2-intro">
      <div class="a2-intro-l rv"><p class="tm-k">About</p><p class="tm-p">A denim label in 2006. A complete menswear studio today — built on fit, fabric and finish.</p></div>
      <p class="a2-lede rv">Vintage Blue is a Delhi studio making denim and the things you wear with it — slowly, in-house, the long way.</p>
    </section>
    <div class="a2-wide rv"><img src="${ED("raw-stairs")}" alt="Model in raw denim on white stairs" style="object-position:50% 30%" /></div>
    <section class="g-sec a2-story">
      ${abImg(ED("lb-seated"), "Model in a sherpa denim jacket and ecru jeans", "a2-story-img rv", "50% 35%")}
      <div class="a2-story-txt rv">
        <p class="tm-k">The story</p>
        <p>We started in 2006 with one fit and one wash. Two decades on, the range has grown — shirts, jackets, cargos, pants — but the way we make it hasn't.</p>
        <p>Our fabric comes through our sister company, Indigo Multifab, after 36 years of sourcing. Indigo is rope-dyed so it fades with depth instead of going flat.</p>
        <p>Every block is tested on real bodies across four cities before it's cut, and a bigger share of each drop is organic or recycled cotton.</p>
        <a class="tm-link" href="/shop" data-link>Shop the collection</a>
      </div>
    </section>
    <section class="g-sec">${abNums()}</section>
    <section class="g-sec">
      <div class="g-head rv"><h2 class="g-title">How it's made</h2></div>
      <div class="g-stag">
        <div class="g-stag-col g-stag-1 rv"><p class="g-stag-note">Rope-dyed at our<br />sister mill.<br /><span>Depth that fades, not flattens.</span></p><div class="g-stag-img"><img src="${ED("denim-back")}" alt="" loading="lazy" style="object-position:50% 60%" /></div><div class="g-stag-cap"><span>Dye</span><em>01</em></div></div>
        <div class="g-stag-col g-stag-2 rv"><div class="g-stag-img"><img src="${ED("brown-overshirt")}" alt="" loading="lazy" style="object-position:50% 25%" /></div><div class="g-stag-cap"><span>Cut</span><em>02</em></div></div>
        <div class="g-stag-col g-stag-3 rv"><p class="g-stag-note">Seams, hardware<br />and wash by hand.<br /><span>Checked twice before it ships.</span></p><div class="g-stag-img"><img src="${ED("lb-collar")}" alt="" loading="lazy" /></div><div class="g-stag-cap"><span>Finish</span><em>03</em></div></div>
      </div>
    </section>
    <section class="g-sec"><div class="g-head rv"><h2 class="g-title">What we stand for</h2></div>${abValues()}</section>
    <section class="a2-close">
      <img src="/assets/ref/sunset.jpg" alt="" aria-hidden="true" loading="lazy" />
      <p class="a2-c a2-c-tl">Our promise</p>
      <p class="a2-c a2-c-ml">Thoughtfully made menswear,<br />worn for years.</p>
      <a class="a2-c a2-c-br" href="/shop" data-link>Shop the collection →</a>
      <p class="a2-c a2-c-bl">Industrial Area A, Delhi<br /><span>Est. 2006</span></p>
    </section>`;
}

// About 3 — chapters: a sticky index on the left, the story scrolls on the right.
function about3() {
  const ch = [
    ["The start", "2006, one fit, one wash. A small denim label in Delhi with a sister mill behind it.", ED("cardigan-navy"), "50% 30%"],
    ["The fabric", "Indigo Multifab has sourced our cloth for 36 years. Rope-dyed indigo, so it fades with depth instead of going flat.", ED("linen-stripe"), "50% 25%"],
    ["The fit", "Every block is tested on real bodies across four cities before a single piece is cut.", ED("polo-pants"), "50% 45%"],
    ["The finish", "Seams, hardware and washes chosen to last — and checked twice before anything ships.", ED("stripe-chair"), "50% 40%"],
  ];
  return `${abSwitch(3)}
    <section class="g-sec ab3-top rv"><h1 class="ab3-h">About<br />Vintage Blue</h1><p class="tm-p">Four short chapters on how we make denim and menswear in Delhi.</p></section>
    <section class="g-sec ab3">
      <aside class="ab3-index"><p class="tm-k">Chapters</p><ol>${ch.map(([t], i) => `<li><a href="#ch${i}" onclick="event.preventDefault();document.getElementById('ch${i}').scrollIntoView({behavior:'smooth',block:'start'})">${t}</a></li>`).join("")}</ol><a class="tm-link" href="/shop" data-link>Shop the collection</a></aside>
      <div class="ab3-body">${ch.map(([t, c, src, pos], i) => `
        <article class="ab3-ch rv" id="ch${i}">
          ${abImg(src, "", "ab3-img", pos)}
          <div class="ab3-txt"><p class="tm-k">${String(i + 1).padStart(2, "0")} — ${t}</p><p class="ab3-p">${c}</p></div>
        </article>`).join("")}
      </div>
    </section>
    <section class="g-sec">${abValues()}</section>`;
}

// About 4 — a timeline down the page, photos alternating sides.
function about4() {
  const years = [
    ["2006", "The first pair", "One fit, one wash, cut and sewn in a single Delhi workshop.", ED("raw-stairs"), "50% 30%"],
    ["Mill", "Our own indigo", "Rope-dyeing moves to our sister mill, Indigo Multifab — depth that fades instead of flattening.", ED("denim-back"), "50% 55%"],
    ["Range", "Beyond denim", "Shirts, truckers, cargos and pants join the range, made the same way.", ED("brown-overshirt"), "50% 25%"],
    ["Fit", "Fit, tested", "Every block tried on real bodies across four cities before it's cut.", "/assets/fits/hulk.png?v=2", "50% 100%"],
    ["Today", "Still in-house", "Eight states, a bigger share of organic and recycled cotton, and no middlemen.", ED("lb-seated"), "50% 35%"],
  ];
  return `${abSwitch(4)}
    <section class="g-sec ab4-top rv"><p class="tm-k">About — since 2006</p><h1 class="ab4-h">Twenty years of<br />denim, the long way.</h1></section>
    <section class="g-sec ab4">${years.map(([y, t, c, src, pos], i) => `
      <article class="ab4-row ${i % 2 ? "flip" : ""} rv">
        <div class="ab4-year">${y}</div>
        ${abImg(src, "", `ab4-img ${src.includes("/fits/") ? "cut" : ""}`, pos)}
        <div class="ab4-txt"><h3>${t}</h3><p>${c}</p></div>
      </article>`).join("")}
    </section>
    <section class="g-sec">${abNums()}</section>`;
}

// About 5 — full-screen chapters, small text in the empty corners.
function about5() {
  const frames = [
    ["/assets/ref/brick2.jpg", "50% 45%", ["About Vintage Blue", "Est. 2006 — Delhi"], "Made the long way.", "Scroll"],
    [ED("raw-stairs"), "50% 35%", ["01 — Fabric", "Indigo Multifab"], "Rope-dyed indigo that fades with depth.", "36 years of sourcing"],
    ["/assets/ref/garage2.jpg", "50% 40%", ["02 — Fit", "Four cities"], "Tested on real bodies before it's cut.", "Six fits"],
    ["/assets/ref/sunset.jpg", "50% 50%", ["03 — Finish", "Checked twice"], "Worn for years, not a season.", "Shop the collection →"],
  ];
  return `${abSwitch(5)}
    ${frames.map(([src, pos, [tl, tl2], mid, br], i) => `
    <section class="ab5">
      <img src="${src}" alt="" loading="${i ? "lazy" : "eager"}" style="object-position:${pos}" />
      <p class="ab5-c ab5-tl">${tl}<br /><span>${tl2}</span></p>
      <p class="ab5-c ab5-ml">${mid}</p>
      ${i === frames.length - 1 ? `<a class="ab5-c ab5-br" href="/shop" data-link>${br}</a>` : `<p class="ab5-c ab5-br">${br}</p>`}
    </section>`).join("")}
    <section class="g-sec">${abValues()}</section>`;
}

// About 6 — a clean grid: statement, the fit line-up, numbers, a photo grid.
function about6() {
  const fits = [["hulk", "Hulk", "Super baggy"], ["rock", "Rock", "Baggy"], ["jazz", "Jazz", "Comfort"], ["brawny", "Brawny", "Straight"]];
  const grid = [["suede-jacket", "Jackets"], ["linen-stripe", "Shirts"], ["polo-pants", "Pants"], ["denim-back", "Denim"], ["cardigan-navy", "Knitwear"], ["lb-pants", "Ecru denim"]];
  return `${abSwitch(6)}
    <section class="g-sec ab6-top">
      <h1 class="ab6-h rv">We make denim<br />in Delhi.</h1>
      <div class="ab6-cols rv"><p>Since 2006 — one fit and one wash at first, a complete menswear range today.</p><p>Fabric through our sister mill, rope-dyed indigo, every block tested on real bodies.</p><p>No middlemen. Every batch checked twice before it ships.</p></div>
    </section>
    <section class="g-sec">
      <div class="g-head rv"><h2 class="g-title">Every fit, made here</h2><a href="/shop/denim" data-link>Shop denim</a></div>
      <div class="ab6-line">${fits.map(([k, n, f]) => `<a class="rv" href="/shop/denim" data-link><div class="ab6-fig"><img src="/assets/fits/${k}.png?v=2" alt="Model in ${n} jeans" loading="lazy" /></div><p><b>${n}</b> <span>${f}</span></p></a>`).join("")}</div>
    </section>
    <section class="g-sec">${abNums()}</section>
    <section class="g-sec">
      <div class="g-head rv"><h2 class="g-title">The range</h2><a href="/shop" data-link>Shop all</a></div>
      <div class="ab6-grid">${grid.map(([n, l]) => `<a class="rv" href="/shop" data-link>${abImg(ED(n), l, "", "50% 30%")}<p>${l}</p></a>`).join("")}</div>
    </section>
    <section class="g-sec">${abValues()}</section>`;
}

// About 7 — the brand story: big opening statement, then chapters with a sticky index.
function about7() {
  const ch = [
    ["Heritage", "It started<br />with denim.", "Founded in 2006 as a men's denim label. In 2022 we grew into a complete menswear brand — shirts, tees, trousers, cargos and jackets.", ED("raw-stairs"), "50% 30%"],
    ["Fabric", "Thirty-six years<br />of cloth behind us.", "Our sister company, Indigo Multifab, has sourced and traded fabric for over 36 years. It's why we can work with premium cloth and hold it to a high standard.", ED("denim-back"), "50% 55%"],
    ["Making", "Built on manufacturing<br />excellence.", "We also make for brands like The Souled Store, Monte Carlo and Octave as a private-label partner — the same care on every line we sew.", ED("brown-overshirt"), "50% 25%"],
    ["Responsibility", "A lasting impression,<br />not a lasting footprint.", "Organic and recycled materials, production offcuts recycled, and garments built to be worn and kept for years.", ED("cardigan-navy"), "50% 30%"],
    ["Today", "Across North<br />and East India.", "Punjab, J&amp;K, Himachal, Uttarakhand, Western UP, Rajasthan, Jharkhand and Bihar — and growing.", ED("lb-seated"), "50% 35%"],
  ];
  const nums = [["2006", "Founded"], ["2022", "Complete menswear"], ["36+", "Years of fabric expertise"], ["08", "States served"]];
  const values = [["Craftsmanship", "Fit, fabric and finish on every piece."], ["Authenticity", "Our own patterns, our own mill."], ["Quality", "Without compromise."], ["Responsibility", "Made to last, made with care."]];
  return `
    <section class="g-sec ab6-top">
      <h1 class="ab6-h rv">Where every thread<br />tells a story.</h1>
      <div class="ab6-cols rv"><p>Since 2006 — a men's denim label that grew into a complete menswear brand.</p><p>Backed by Indigo Multifab and 36 years of fabric expertise.</p><p>Fit, fabric and finish, without compromise. Made to be worn for years.</p></div>
    </section>

    <section class="g-sec ab3 ab7">
      <aside class="ab3-index"><p class="tm-k">Our story</p><ol id="abIndex">${ch.map(([t], i) => `<li><a href="#ch${i}" data-ch="${i}" onclick="event.preventDefault();document.getElementById('ch${i}').scrollIntoView({behavior:'smooth',block:'start'})"><span>${String(i + 1).padStart(2, "0")}</span>${t}</a></li>`).join("")}</ol><a class="tm-link" href="/shop" data-link>Shop the collection</a></aside>
      <div class="ab3-body">${ch.map(([t, h, c, src, pos], i) => `
        <article class="ab3-ch rv" id="ch${i}" data-ch="${i}">
          ${abImg(src, "", "ab3-img", pos)}
          <div class="ab3-txt"><p class="tm-k">${String(i + 1).padStart(2, "0")} — ${t}</p><h2 class="ab7-h">${h}</h2><p class="ab7-p">${c}</p></div>
        </article>`).join("")}
      </div>
    </section>

    <section class="g-sec">${`<div class="a2-nums">${nums.map(([n, l]) => `<div class="rv"><b>${n}</b><span>${l}</span></div>`).join("")}</div>`}</section>

    <section class="g-sec ab7-phil">
      <p class="tm-k rv">Our philosophy</p>
      <p class="ab7-big rv">Great style is never excessive.</p>
      <div class="ab7-values">${values.map(([h, c]) => `<div class="rv"><h3>${h}</h3><p>${c}</p></div>`).join("")}</div>
    </section>

    <section class="a2-close">
      <img src="/assets/ref/garage2.jpg" alt="" aria-hidden="true" loading="lazy" style="object-position:50% 35%" />
      <p class="a2-c a2-c-tl">Our promise</p>
      <p class="a2-c a2-c-ml">Thoughtfully designed menswear,<br />made to be worn for years.</p>
      <a class="a2-c a2-c-br" href="/shop" data-link>Shop the collection →</a>
      <p class="a2-c a2-c-bl">Vintage Blue Jeanswear<br /><span>Est. 2006</span></p>
    </section>`;
}

// Highlights the chapter you're reading in the sticky index.
function bindAbout7() {
  const idx = document.getElementById("abIndex");
  if (!idx) return;
  const links = idx.querySelectorAll("a");
  const obs = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.dataset.ch === e.target.dataset.ch));
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll(".ab3-ch[data-ch]").forEach((el) => obs.observe(el));
}

/* ---------- Lookbook pages (v2 system): six layouts, same looks ---------- */
const LB2 = [
  { id: "01", name: "Sherpa & ecru", word: "Ecru", line: "Washed black denim, a sherpa collar, ecru cut wide.", img: "lb-seated", pos: "50% 35%", more: ["lb-collar", "lb-pants"], shop: ["denim-jacket-152-coal-grey", "brawny-5464-off-white"] },
  { id: "02", name: "Raw, head to toe", word: "Raw", line: "Unwashed indigo, top and bottom. Yours to break in.", img: "raw-stairs", pos: "50% 30%", more: ["denim-back"], shop: ["denim-fur-jacket-167-dark-blue", "brawny-5547-dark-indigo"] },
  { id: "03", name: "The cropped jacket", word: "Cropped", line: "Boxy and short, worn over ecru denim.", img: "suede-jacket", pos: "50% 30%", more: ["cardigan-navy"], shop: ["corduroy-jacket-171-black", "brawny-5464-off-white"] },
  { id: "04", name: "Light layers", word: "Linen", line: "A washed shirt, a knit on the shoulders, cream trousers.", img: "linen-stripe", pos: "50% 25%", more: ["polo-pants"], shop: ["denim-shirt-0042-washed-blue", "light-weight-pant-4037-cream"] },
  { id: "05", name: "Brown is the new navy", word: "Earth", line: "A heavy overshirt in brown, worn over cream.", img: "brown-overshirt", pos: "50% 25%", more: ["stripe-chair"], shop: ["corduroy-shirt-141-3-brown", "comfort-pant-4038-cream"] },
  { id: "06", name: "Washed blue", word: "Faded", line: "Double denim in a light wash, worn loose.", img: "denim-back", pos: "50% 45%", more: ["raw-stairs"], shop: ["denim-jacket-164-tinted-blue", "hulk-32004-ice-berg"] },
];
const lbPieces = (L) => L.shop.map((h) => byHandle.get(h)).filter(Boolean);
const lbTotal = (L) => inr(lbPieces(L).reduce((n, p) => n + p.price, 0));
const lbFront = (p) => p.images.find((x) => x.includes("-front")) || p.images[0];
const lbList = (L) => `<ul class="lb2-list">${lbPieces(L).map((p) => `<li><a href="/product/${p.handle}" data-link><img src="${lbFront(p)}" alt="" loading="lazy" /><span>${esc(p.name)}</span></a><b>${inr(p.price)}</b><button type="button" data-add="${p.handle}" aria-label="Add ${esc(p.name)} to bag">${plus}</button></li>`).join("")}</ul>`;
const lbAdd = (L, cls = "") => `<button type="button" class="tm-btn ${cls}" data-add-all="${L.shop.join(",")}">Add the look · ${lbTotal(L)}</button>`;
// The layout switcher is hidden now that the lookbook is settled.
const lbSwitch = () => "";

// 2 — Thom Morison: a quiet text column, each look as a row of pictures.
function lookbook2() {
  return `${lbSwitch(2)}<div id="lookbook">
    <section class="g-sec lb2-top"><div class="tm-l rv"><p class="tm-k">Lookbook — Winter 2026</p><p class="tm-p">Six looks, shot in-house. Every piece is in store now.</p></div><p class="a2-lede rv">Denim, worn six ways.</p></section>
    ${LB2.map((L, i) => `
    <section class="g-sec lb2-row ${i % 2 ? "flip" : ""}">
      <div class="lb2-txt rv"><p class="tm-k">Look ${L.id}</p><h2 class="lb2-h">${L.name}</h2><p class="tm-p">${L.line}</p>${lbList(L)}${lbAdd(L)}</div>
      <div class="lb2-pics">${[L.img, ...L.more].map((n, k) => abImg(ED(n), "", `rv lb2-pic lb2-pic-${k}`, k ? "50% 40%" : L.pos)).join("")}</div>
    </section>`).join("")}</div>`;
}

// 3 — script titles over paired pictures, a small card for the words.
function lookbook3() {
  return `${lbSwitch(3)}<div id="lookbook">${LB2.slice(0, 5).map((L, i) => `
    <section class="lb3 ${["a", "b", "c"][i % 3]}">
      ${abImg(ED(L.img), "", "lb3-a rv", L.pos)}
      ${abImg(ED(L.more[0]), "", "lb3-b rv", "50% 35%")}
      <p class="lb3-word" aria-hidden="true">${L.word}</p>
      <div class="lb3-card rv"><p class="lb3-script">Look ${L.id}</p><p class="tm-p">${L.line}</p>${lbAdd(L, "full")}</div>
    </section>`).join("")}</div>`;
}

// 4 — newsletter: one narrow column, wordmark over the first picture, pieces, close-ups.
function lookbook4() {
  const A = LB2[0], B = LB2[1], C = LB2[2];
  const row = (L) => `<div class="lb4-prods">${lbPieces(L).map((p) => `<a href="/product/${p.handle}" data-link><div class="ab-img lb4-flat"><img src="${lbFront(p)}" alt="" loading="lazy" /></div><p>${esc(p.name)} <b>${inr(p.price)}</b></p></a>`).join("")}</div>`;
  return `${lbSwitch(4)}<div id="lookbook"><div class="lb4">
    <div class="lb4-hero">${abImg(ED("denim-back"), "", "", "50% 40%")}<p class="lb4-mark">Vintage Blue</p><p class="lb4-script">the winter book</p></div>
    <div class="lb4-txt"><p class="tm-k">New season staples</p><p class="tm-p">Washed black, raw indigo and ecru — three looks built from pieces you'll wear all year.</p><a class="lb4-btn" href="/shop" data-link>Shop the looks</a></div>
    ${abImg(ED(A.img), "", "lb4-full", A.pos)}${row(A)}
    ${abImg(ED("lb-collar"), "", "lb4-detail", "50% 50%")}
    ${abImg(ED(B.img), "", "lb4-full", B.pos)}${row(B)}
    <div class="lb4-two">${abImg(ED(C.img), "", "", C.pos)}${abImg(ED("cardigan-navy"), "", "", "50% 30%")}</div>${row(C)}
    <div class="lb4-txt"><a class="lb4-btn" href="/shop" data-link>Explore the collection</a></div>
    <ul class="lb4-links"><li><a href="/shop/denim" data-link>Shop denim</a><a href="/shop/jackets" data-link>Shop jackets</a></li><li><a href="/shop/shirts" data-link>Shop shirts</a><a href="/shop/pants" data-link>Shop pants</a></li></ul>
  </div></div>`;
}

// 5 — one long horizontal reel, pieces underneath each picture.
function lookbook5() {
  return `${lbSwitch(5)}<div id="lookbook">
    <section class="g-sec lb5-top"><h1 class="ab3-h rv">The winter book</h1><p class="tm-p rv">Six looks. Drag or scroll sideways →</p></section>
    <div class="lb5-reel">${LB2.map((L) => `
      <article class="lb5-card">${abImg(ED(L.img), "", "lb5-img", L.pos)}
        <div class="lb5-meta"><p class="tm-k">Look ${L.id} — ${L.name}</p>${lbPieces(L).map((p) => `<p class="lb5-p"><a href="/product/${p.handle}" data-link>${esc(p.name)}</a><b>${inr(p.price)}</b></p>`).join("")}${lbAdd(L)}</div>
      </article>`).join("")}</div></div>`;
}

// 6 — index grid: every look at once, pieces appear on hover.
function lookbook6() {
  return `${lbSwitch(6)}<div id="lookbook">
    <section class="g-sec"><div class="g-head rv"><h1 class="g-title">Lookbook — Winter 2026</h1><span class="tm-p" style="margin:0">${LB2.length} looks</span></div>
      <div class="lb6">${LB2.map((L) => `
        <article class="lb6-card rv">${abImg(ED(L.img), "", "lb6-img", L.pos)}
          <div class="lb6-over">${lbPieces(L).map((p) => `<p><span>${esc(p.name)}</span><b>${inr(p.price)}</b></p>`).join("")}${lbAdd(L, "light")}</div>
          <p class="lb6-cap"><span>Look ${L.id}</span>${L.name}</p>
        </article>`).join("")}</div>
    </section></div>`;
}

// 7 — one look per screen: picture left, the look on the right.
function lookbook7() {
  return `${lbSwitch(7)}<div id="lookbook">${LB2.map((L, i) => `
    <section class="lb7">
      ${abImg(ED(L.img), "", "lb7-img", L.pos)}
      <div class="lb7-r">
        <p class="tm-k">Look ${L.id} / ${String(LB2.length).padStart(2, "0")}</p>
        <div><h2 class="lb7-h">${L.name}</h2><p class="tm-p">${L.line}</p></div>
        ${abImg(ED(L.more[0]), "", "lb7-small", "50% 40%")}
        <div>${lbList(L)}${lbAdd(L, "full")}</div>
      </div>
    </section>`).join("")}</div>`;
}

// 8 — the final mix: poster hero, a pinned sideways reel, one featured look, details, categories.
// 10 — split cover, two campaign panels, editorial index, product grid with a fabric close-up, catalogue spread.
function lookbook10() {
  const P = (h) => byHandle.get(h);
  const cells = (hs) => hs.map(P).filter(Boolean).map(uyCard).join("");
  const panel = (img, pos, kicker, head, label, to) => `
    <a class="lb10-panel rv" href="${to}" data-link>
      ${abImg(ED(img), "", "lb10-panel-img", pos)}
      <div class="lb10-panel-txt"><p class="lb10-kick">${kicker}</p><h3 class="lb10-head">${head}</h3><span class="lb10-pill">${label} ↗</span></div>
    </a>`;
  const spreadPic = (img, pos, h) => {
    const p = P(h);
    return `<figure class="lb10-sp-fig">${abImg(ED(img), "", "lb10-sp-img", pos)}${p ? `<figcaption><a href="/product/${p.handle}" data-link>${esc(p.name)}</a><span>${inr(p.price)}</span></figcaption>` : ""}</figure>`;
  };
  const jk = P("denim-jacket-152-coal-grey"), pt = P("brawny-5464-off-white");
  const img = (p, k) => (p ? p.images.find((x) => x.includes(k)) || p.images[0] : "");
  // 3×3 cells over one photo; null cells show the photo through.
  // top-right: the jacket close-up, bottom-left: the trouser close-up — both from this shoot.
  const mosaic = [null, null, ["lb-collar", jk, "Close-up of the sherpa collar on the washed black jacket", "50% 40%"], null, null, null, ["lb-pants", pt, "Close-up of the wide ecru trousers", "50% 55%"], null, null];
  return `
    <section class="lb10-cover" aria-label="Winter 2026 lookbook">
      <div class="lb10-cover-half">${abImg(ED("brown-overshirt"), "Model in a brown overshirt and cream trousers", "lb10-cover-img", "50% 20%")}</div>
      <div class="lb10-cover-half">${abImg(ED("lb-seated"), "Model in a washed black sherpa jacket and ecru jeans", "lb10-cover-img", "50% 30%")}</div>
      <p class="lb10-word" aria-hidden="true">Winter</p>
      <div class="lb10-card"><p class="lb10-card-k">Lookbook — Winter 2026</p><p>Six looks in denim, cord and cream.</p><a href="#lb10-looks" class="lb10-card-a">See the looks ↓</a></div>
    </section>

    <section class="lb10-duo">
      ${panel("raw-stairs", "50% 30%", "The raw jacket", "Raw, head to toe.", "Shop jackets", "/shop/jackets")}
      ${panel("linen-stripe", "50% 25%", "The washed shirt", "Light layers.", "Shop shirts", "/shop/shirts")}
    </section>

    <section class="g-sec lb10-time" id="lb10-looks">
      <aside class="lb10-time-side rv">
        <h2 class="lb10-time-h">Timeless</h2>
        <p class="lb10-time-p">Six looks for winter, built from the pieces we make — heavy denim, washed cord and cream trousers cut wide. Wear them as shown, or take a single piece and build your own around it.</p>
      </aside>
      <div class="lb10-time-pics">
        <figure class="rv">${abImg(ED("suede-jacket"), "Model in a cropped navy jacket and ecru jeans", "lb10-time-img", "50% 25%")}<figcaption>${esc(LB2[2].name)} — ${esc(LB2[2].line)}</figcaption></figure>
        <figure class="rv">${abImg(ED("cardigan-navy"), "Model in a cream jacket, striped tee and navy trousers", "lb10-time-img", "50% 30%")}<figcaption>Cream jacket, striped tee, navy trousers.</figcaption></figure>
      </div>
    </section>

    <section class="g-sec lb10-mosaic-sec">
      <div class="g-head rv"><h2 class="g-title">The grid — ${esc(LB2[0].name)}</h2><a href="/shop/jackets" data-link>Shop the look</a></div>
      <div class="lb10-mosaic">
        ${abImg(ED("lb-seated"), "Model in a washed black sherpa jacket and ecru jeans", "lb10-mosaic-bg", "50% 30%")}
        <div class="lb10-cells">${mosaic.map((c) => c
          ? `<a href="${c[1] ? `/product/${c[1].handle}` : "/shop"}" class="lb10-cell lb10-cell-p" data-link><span class="lb10-panel-in lb10-panel-photo"><img src="${ED(c[0])}" alt="${c[2]}" loading="lazy" style="object-position:${c[3]}" /></span>${c[1] ? `<span class="lb10-tag">${esc(c[1].name)} · ${inr(c[1].price)}</span>` : ""}</a>`
          : `<div class="lb10-cell" aria-hidden="true"></div>`).join("")}</div>
      </div>
      <div class="lb10-mosaic-foot"><p>${esc(LB2[0].line)}</p>${lbAdd(LB2[0])}</div>
    </section>

    <section class="lb10-spread-sec">
      <div class="lb10-spread-side rv"><p class="lb10-yr">W<span>/</span>26</p><p class="lb10-vert">Vintage Blue<br />Collection</p></div>
      <div class="lb10-spread rv">
        <div class="lb10-page lb10-page-l">
          <p class="lb10-pg-top"><span>Look 06</span><span>${esc(LB2[5].name)}</span></p>
          ${spreadPic("denim-back", "50% 40%", "denim-jacket-164-tinted-blue")}
          <p class="lb10-pg-n">18</p>
        </div>
        <div class="lb10-page lb10-page-r">
          <p class="lb10-pg-top"><span>Looks 04 — 05</span><span>From ${lbTotal(LB2[3])}</span></p>
          <div class="lb10-sp-grid">
            ${spreadPic("polo-pants", "50% 20%", "light-weight-pant-4037-cream")}
            ${spreadPic("stripe-chair", "50% 30%", "corduroy-shirt-141-3-brown")}
            ${spreadPic("lb-pants", "50% 60%", "brawny-5464-off-white")}
            ${spreadPic("lb-collar", "50% 40%", "denim-jacket-152-coal-grey")}
          </div>
          <p class="lb10-pg-n">19</p>
        </div>
      </div>
    </section>`;
}

function lookbook8() {
  const F = LB2[0];
  const cats = [["denim", "Denim", "Six fits, every wash."], ["jackets", "Jackets", "Truckers, sherpa and cord."], ["shirts", "Shirts", "Denim, cord and stripes."], ["pants", "Pants", "Pleated, relaxed, cream to black."]];
  return `${lbSwitch(8)}<div id="lookbook">
    <section class="lbh" aria-label="Lookbook Winter 2026">
      <div class="lbh-sheet"><img src="/assets/ref/garage2.jpg" alt="Model in light-wash double denim leaning on a black car" /></div>
      <p class="lbh-word" aria-hidden="true">LOOKBOOK</p>
      <div class="lbh-sheet lbh-fg"><img src="/assets/ref/garage2-person.png" alt="" /></div>
      <div class="lbh-t lbh-row"><span>Denim that<br />takes its time</span><span>Winter<br />2026</span><span>Six looks,<br />shot in-house</span></div>
      <div class="lbh-t lbh-bl"><p>Look 01 — 06<br /><i>Keep scrolling</i></p></div>
      <div class="lbh-t lbh-br"><a class="h2-shop" href="#reel" onclick="event.preventDefault();document.getElementById('reel').scrollIntoView({behavior:'smooth'})"><span class="sq"></span>View<br />the looks<span class="bar"></span></a></div>
    </section>

    <section class="lb8-break rv"><p class="tm-k">Winter 2026</p><p class="lb8-line">Six looks</p></section>

    <section class="lb8-pin" id="reel" aria-label="Six looks">
      <div class="lb8-stick">
        <div class="lb8-bar"><span>Look <b id="lbNow">01</b> / ${String(LB2.length).padStart(2, "0")}</span><span class="lb8-prog"><i id="lbProg"></i></span></div>
        <div class="lb8-track" id="lbTrack">${LB2.map((L) => `
          <article class="lb8-card">${abImg(ED(L.img), "", "lb8-img", L.pos)}
            <div class="lb8-meta"><p class="tm-k">Look ${L.id} — ${L.name}</p>${lbPieces(L).map((p) => `<p class="lb5-p"><a href="/product/${p.handle}" data-link>${esc(p.name)}</a><b>${inr(p.price)}</b></p>`).join("")}${lbAdd(L)}</div>
          </article>`).join("")}
          <article class="lb8-end"><p class="lb8-line">That's the book.</p><a class="tm-link" href="/shop" data-link>Shop everything</a></article>
        </div>
      </div>
    </section>

    <section class="lb8-break rv"><p class="tm-k">Look of the season</p><p class="lb8-line">Sherpa &amp; ecru</p></section>

    <section class="lb7 lb8-feature">
      ${abImg(ED(F.img), "", "lb7-img", F.pos)}
      <div class="lb7-r">
        <p class="tm-k">Look ${F.id} / ${String(LB2.length).padStart(2, "0")}</p>
        <div><h2 class="lb7-h">${F.name}</h2><p class="tm-p">${F.line}</p></div>
        <div class="lb8-pair">${abImg(ED("lb-collar"), "", "lb7-small", "50% 50%")}${abImg(ED("lb-pants"), "", "lb7-small", "50% 60%")}</div>
        <div>${lbList(F)}${lbAdd(F, "full")}</div>
      </div>
    </section>

    <section class="g-sec lb8-new">
      <div class="lb8-new-l rv"><p class="tm-k">New arrivals</p><p class="tm-p">New washes in our three widest fits, in store now.</p><a class="tm-link" href="/shop/denim" data-link>Shop denim</a></div>
      ${[["hulk-32004-ice-berg", "hulk"], ["rock-163-dark-navy", "rock"], ["brawny-5462-navy", "brawny"]].map(([h, pic]) => {
        const p = byHandle.get(h);
        return `<a class="lb8-new-card rv" href="/product/${p.handle}" data-link><div class="lb8-new-img"><img src="/assets/fits/${pic}.png?v=2" alt="Model in ${esc(p.name)}" loading="lazy" /></div><p>${esc(p.type)}<br /><span>${esc(colorOf(p))}</span></p><p>${inr(p.price)}</p></a>`;
      }).join("")}
    </section>


    <section class="lb8-break rv"><p class="lb8-line">Shop by category</p></section>
    <section class="g-sec lb8-cats">
      <ol class="g-catrows">${cats.map(([slug, label, line]) => {
        const n = products.filter((p) => p.categories.includes(slug)).length;
        return `<li class="rv"><a href="/shop/${slug}" data-link><span class="g-cr-name">${label}</span><span class="g-cr-line">${line}</span><span class="g-cr-count">${n} pieces</span><span class="g-cr-arrow">${go2}</span></a></li>`;
      }).join("")}</ol>
    </section>
  </div>`;
}

// 9 — the same page, all on black.
function lookbook9() {
  return lookbook8();
}

// Pinned sideways reel: vertical scroll drives the track across.
function bindLookbook8() {
  removeEventListener("scroll", window.__lbPin || (() => {}));
  removeEventListener("resize", window.__lbSize || (() => {}));
  const pin = document.querySelector(".lb8-pin"), track = document.getElementById("lbTrack");
  if (!pin || !track) return;
  const now = document.getElementById("lbNow"), prog = document.getElementById("lbProg");
  const size = () => { pin.style.height = `${track.scrollWidth - innerWidth + innerHeight}px`; move(); };
  const move = () => {
    const r = pin.getBoundingClientRect();
    const span = pin.offsetHeight - innerHeight;
    const t = Math.min(1, Math.max(0, -r.top / (span || 1)));
    track.style.transform = `translate3d(${-t * (track.scrollWidth - innerWidth)}px,0,0)`;
    prog.style.transform = `scaleX(${t})`;
    now.textContent = String(Math.min(LB2.length, Math.floor(t * LB2.length) + 1)).padStart(2, "0");
  };
  window.__lbPin = move;
  window.__lbSize = size;
  addEventListener("scroll", move, { passive: true });
  addEventListener("resize", size);
  document.querySelectorAll(".lb8-track img").forEach((im) => im.addEventListener("load", size, { once: true }));
  size();
}

// Contact (v2): split screen — picture left, the form right; studio + private label cards; FAQ accordion.
function contact2() {
  const faqs = [
    ["Is shipping free?", "Yes, on every order over ₹2,999."],
    ["Can I return something?", "Yes — easy returns within 15 days of delivery."],
    ["Which fit should I choose?", "Tell us your usual size and how you like your jeans to sit, and we'll suggest a fit."],
    ["Do you make for other brands?", "Yes. We're a manufacturing and private-label partner for retailers and fashion brands."],
  ];
  return `
    <section class="ct2">
      <div class="ct2-img">${abImg(ED("lb-seated"), "Model in a sherpa denim jacket and ecru jeans", "", "50% 35%")}<p class="ct2-cap">Vintage Blue Jeanswear<br /><span>Since 2006</span></p></div>
      <div class="ct2-r">
        <div><p class="tm-k">Contact</p><h1 class="ct2-h">Write to us.</h1><p class="tm-p">We usually reply within a day.</p></div>
        <form class="ct-form" id="ctForm" novalidate>
          <div class="ct2-two"><label><span>Name</span><input name="name" required autocomplete="name" /></label><label><span>Email</span><input name="email" type="email" required autocomplete="email" /></label></div>
          <label><span>Topic</span><select name="topic"><option>An order</option><option>Fit &amp; sizing</option><option>Wholesale / private label</option><option>Press</option><option>Something else</option></select></label>
          <label><span>Message</span><textarea name="message" rows="4" required></textarea></label>
          <button class="tm-btn full" type="submit">Send message</button>
          <p class="ct-done" id="ctDone" hidden>Thank you — we'll be in touch soon.</p>
        </form>
        <p class="ct2-mail">Or email <a href="mailto:hello@vintageblue.studio">hello@vintageblue.studio</a></p>
      </div>
    </section>

    <section class="g-sec ct2-cards">
      <div class="ct2-card rv"><p class="tm-k">The studio</p><p class="ct2-big">Industrial Area A, Delhi</p><p class="tm-p">Open 10am – 6pm IST.</p><a class="tm-link" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Industrial Area A, Delhi, India")}" target="_blank" rel="noopener">Get directions ↗</a></div>
      <div class="ct2-card dark rv"><p class="tm-k">Brands &amp; retailers</p><p class="ct2-big">Manufacturing and private label.</p><p class="tm-p">Backed by 36 years of fabric sourcing through Indigo Multifab.</p><a class="tm-link" href="mailto:hello@vintageblue.studio?subject=Private%20label">Start a conversation ↗</a></div>
    </section>

    <section class="g-sec ct2-faq">
      <p class="tm-k rv">Questions</p>
      ${faqs.map(([q, a]) => `<details class="rv"><summary>${q}<i aria-hidden="true">+</i></summary><p>${a}</p></details>`).join("")}
    </section>`;
}

function bindContact2() {
  const f = document.getElementById("ctForm");
  if (!f) return;
  const sel = document.getElementById("ctSubject"), other = document.getElementById("ctOther");
  if (sel && other) sel.addEventListener("change", () => {
    const on = sel.value === "Other";
    other.hidden = !on;
    other.querySelector("input").required = on;
    if (on) other.querySelector("input").focus();
  });
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    f.querySelectorAll("label, button, .ct2-two, p:not(.ct-done), textarea").forEach((el) => (el.hidden = true));
    document.getElementById("ctDone").hidden = false;
  });
}

/* ---------- Contact layouts 3–8 (no pictures on the form) ---------- */
const CT_MAP = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Industrial Area A, Delhi, India")}`;
const ctTopics = ["Order enquiry", "Returns & exchanges", "Fit & sizing", "Wholesale / private label", "Collaborations & press"];
const ctSwitch = (n) => `<nav class="ab-switch" aria-label="Contact layouts">${[3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => `<a href="/contact${k}" data-link class="${k === n ? "on" : ""}">Contact ${k}</a>`).join("")}</nav>`;
// Name, email, subject (starts empty; "Other" lets them type their own), message.
const ctFields = (opts = {}) => `
  <form class="ct-form cf ${opts.cls || ""}" id="ctForm" novalidate>
    <div class="ct2-two">
      <label><span>Name</span><input name="name" required autocomplete="name" placeholder="Your name" /></label>
      <label><span>Email</span><input name="email" type="email" required autocomplete="email" placeholder="you@email.com" /></label>
    </div>
    <label class="cf-select"><span>Subject</span>
      <select name="subject" id="ctSubject" required>
        <option value="" selected disabled>Choose a subject</option>
        ${ctTopics.map((t) => `<option>${esc(t)}</option>`).join("")}
        <option value="Other">Other</option>
      </select>
    </label>
    <label class="cf-other" id="ctOther" hidden><span>Your subject</span><input name="subject_other" placeholder="Tell us what it's about" /></label>
    <label><span>Message</span><textarea name="message" rows="${opts.rows || 5}" required placeholder="Write your message"></textarea></label>
    <button class="tm-btn full cf-send" type="submit">${opts.btn || "Send message"} <span aria-hidden="true">→</span></button>
    <p class="ct-done" id="ctDone" hidden>Thank you — your message is on its way. We'll reply within a day.</p>
  </form>`;
// Map with the studio card on top.
const ctMap = () => `
  <section class="g-sec cf-map rv">
    <div class="cf-map-frame">
      <iframe title="Map to the Vintage Blue studio" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent("Industrial Area A, Delhi, India")}&output=embed"></iframe>
      <div class="cf-map-card"><p class="tm-k">The studio</p><p class="cf-map-big">Industrial Area A, Delhi</p><p class="tm-p">Open 10am – 6pm IST</p><a class="tm-btn" href="${CT_MAP}" target="_blank" rel="noopener">Get directions ↗</a></div>
    </div>
  </section>`;
const ctDetails = () => `
  <dl class="ctx-dl">
    <div><dt>Email</dt><dd><a href="mailto:hello@vintageblue.studio">hello@vintageblue.studio</a></dd></div>
    <div><dt>Studio</dt><dd>Industrial Area A, Delhi</dd></div>
    <div><dt>Hours</dt><dd>10am – 6pm IST</dd></div>
    <div><dt>Directions</dt><dd><a href="${CT_MAP}" target="_blank" rel="noopener">Open in Maps ↗</a></dd></div>
  </dl>`;

// 3 — one centred column: heading, form, details in a row.
function contact3() {
  return `${ctSwitch(3)}
    <section class="g-sec cx3">
      <p class="tm-k rv">Contact</p>
      <h1 class="cx3-h rv">How can we help?</h1>
      <div class="rv">${ctFields({ rows: 5 })}</div>
      <div class="cx3-row rv"><span><b>Email</b><a href="mailto:hello@vintageblue.studio">hello@vintageblue.studio</a></span><span><b>Studio</b>Industrial Area A, Delhi</span><span><b>Hours</b>10am – 6pm IST</span></div>
    </section>
    ${ctMap()}`;
}

// 4 — big type details left, form right.
function contact4() {
  return `${ctSwitch(4)}
    <section class="g-sec cx4">
      <div class="cx4-l rv">
        <p class="tm-k">Contact</p>
        <a class="cx4-big" href="mailto:hello@vintageblue.studio">hello@<br />vintageblue.studio</a>
        <p class="cx4-mid">Industrial Area A, Delhi</p>
        <p class="cx4-mid soft">10am – 6pm IST</p>
        <a class="tm-link" href="${CT_MAP}" target="_blank" rel="noopener">Get directions ↗</a>
      </div>
      <div class="cx4-r rv"><p class="tm-k">Or send a message</p>${ctFields()}</div>
    </section>
    ${ctMap()}`;
}

// 9–11 — contact 4's layout with the chosen form grids: spec sheet, numbered index, night.
const cxGrid = (n, cls) => `${n === 11 ? "" : ctSwitch(n)}
    <section class="g-sec cx4">
      <div class="cx4-l rv">
        <p class="tm-k">Contact</p>
        <a class="cx4-big" href="mailto:hello@vintageblue.studio">hello@<br />vintageblue.studio</a>
        <p class="cx4-mid">Industrial Area A, Delhi</p>
        <p class="cx4-mid soft">10am – 6pm IST</p>
        <a class="tm-link" href="${CT_MAP}" target="_blank" rel="noopener">Get directions ↗</a>
      </div>
      <div class="cx4-r rv"><p class="tm-k">Or send a message</p>${ctFields({ cls })}</div>
    </section>
    ${ctMap()}`;
const contact9 = () => cxGrid(9, "fg2");
const contact10 = () => cxGrid(10, "fg3");
const contact11 = () => cxGrid(11, "fg7");

// 5 — the form on a black panel, details on the page below.
function contact5() {
  return `${ctSwitch(5)}
    <section class="cx5 rv">
      <div class="cx5-in"><p class="tm-k">Contact</p><h1 class="cx5-h">Write to us.</h1><p class="cx5-p">We usually reply within a day.</p>${ctFields({ cls: "on-dark" })}</div>
    </section>
    <section class="g-sec">${ctDetails()}</section>
    ${ctMap()}`;
}

// 6 — a sentence you fill in.
function contact6() {
  return `${ctSwitch(6)}
    <section class="g-sec cx6">
      <p class="tm-k rv">Contact</p>
      <form class="cx6-form rv" id="ctForm" novalidate>
        <p>Hi, my name is <input name="name" required placeholder="your name" autocomplete="name" /> and I'd like to talk about
        <select name="subject" id="ctSubject" required><option value="" selected disabled>choose a subject</option>${ctTopics.map((t) => `<option>${esc(t.toLowerCase())}</option>`).join("")}<option value="Other">something else</option></select><span class="cf-other" id="ctOther" hidden> — <input name="subject_other" placeholder="what about?" /></span>.
        You can reach me at <input name="email" type="email" required placeholder="your email" autocomplete="email" />.</p>
        <textarea name="message" rows="3" required placeholder="Anything else? (optional details)"></textarea>
        <button class="tm-btn" type="submit">Send it</button>
        <p class="ct-done" id="ctDone" hidden>Thank you — we'll be in touch soon.</p>
      </form>
      <div class="cx3-row rv"><span><b>Email</b><a href="mailto:hello@vintageblue.studio">hello@vintageblue.studio</a></span><span><b>Studio</b>Industrial Area A, Delhi</span><span><b>Hours</b>10am – 6pm IST</span></div>
    </section>
    ${ctMap()}`;
}

// 7 — choose a topic first, then the form.
function contact7() {
  const tiles = [["Order enquiry", "Tracking, changes, delivery."], ["Fit & sizing", "Help choosing a fit or size."], ["Wholesale / private label", "Making for your brand or store."], ["Other", "Anything else — tell us below."]];
  return `${ctSwitch(7)}
    <section class="g-sec cx7">
      <div class="g-head rv"><h1 class="g-title">Contact — what's it about?</h1><a href="mailto:hello@vintageblue.studio">hello@vintageblue.studio</a></div>
      <div class="cx7-tiles rv" id="ctTiles">${tiles.map(([t, c], i) => `<button type="button" class="cx7-tile" data-topic="${esc(t)}"><b>${esc(t)}</b><span>${c}</span></button>`).join("")}</div>
      <div class="cx7-form rv">${ctFields()}</div>
    </section>
    <section class="g-sec">${ctDetails()}</section>
    ${ctMap()}`;
}

// 8 — the email as the hero, compact form, FAQ.
function contact8() {
  const faqs = [["Is shipping free?", "Yes, on every order over ₹2,999."], ["Can I return something?", "Yes — easy returns within 15 days of delivery."], ["Do you make for other brands?", "Yes. We're a manufacturing and private-label partner for retailers and fashion brands."]];
  return `${ctSwitch(8)}
    <section class="g-sec cx8-top rv">
      <p class="tm-k">The quickest way to reach us</p>
      <a class="cx8-mail" href="mailto:hello@vintageblue.studio">hello@vintageblue.studio</a>
      <p class="tm-p">Industrial Area A, Delhi · 10am – 6pm IST · <a class="tm-link" href="${CT_MAP}" target="_blank" rel="noopener">Directions ↗</a></p>
    </section>
    <section class="g-sec cx8">
      <div class="rv"><p class="tm-k">Send a message</p>${ctFields({ rows: 3 })}</div>
      <div class="ct2-faq rv"><p class="tm-k">Questions</p>${faqs.map(([q, a]) => `<details><summary>${q}<i aria-hidden="true">+</i></summary><p>${a}</p></details>`).join("")}</div>
    </section>
    ${ctMap()}`;
}

function bindContactTiles() {
  const tiles = document.getElementById("ctTiles");
  if (!tiles) return;
  tiles.addEventListener("click", (e) => {
    const b = e.target.closest("[data-topic]");
    if (!b) return;
    tiles.querySelectorAll("[data-topic]").forEach((x) => x.classList.toggle("on", x === b));
    const sel = document.getElementById("ctSubject");
    sel.value = b.dataset.topic;
    sel.dispatchEvent(new Event("change"));
  });
}

const SORTS = [
  ["featured", "Featured"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["name-asc", "Name: A to Z"],
];

const CARGO_ORDER = [
  "comfort-cargo-9018-mouse",
  "comfort-cargo-9018-black",
  "comfort-cargo-9018-dark-grey",
  "comfort-cargo-9019-stone",
  "comfort-cargo-9018-light-olive",
  "comfort-cargo-9018-cream",
  "comfort-cargo-9019-black",
  "comfort-cargo-9019-grey",
  "comfort-cargo-9019-coffee",
  "comfort-cargo-9019-cream",
  "comfort-cargo-9019-navy",
  "comfort-cargo-9018-olive",
  "comfort-cargo-9019-khaki",
  "comfort-cargo-9019-olive",
];

const PANTS_ORDER = [
  "light-weight-pant-4037-light-grey",
  "light-weight-pant-4035-khaki",
  "light-weight-pant-4037-cream",
  "light-weight-pant-4035-navy",
  "light-weight-pant-4035-pista",
  "heavy-pant-4036-black",
  "heavy-pant-4036-olive",
  "comfort-pant-4038-cream",
  "comfort-pant-4038-black",
  "comfort-pant-4038-beige",
  "comfort-pant-4038-khaki",
];

// Products page hero: only the denim page gets one — the four fits side by side.
function shopHero(cat, type) {
  if (cat !== "denim") return "";
  const fits = [["Hulk", "hulk", "Super baggy"], ["Rock", "rock", "Baggy"], ["Jazz", "jazz", "Comfort"], ["Brawny", "brawny", "Straight"]];
  return `<section class="sh-fits" aria-label="Denim fits">${fits.map(([t, pic, f]) => `
    <a class="sh-fit${type === t ? " on" : ""}" href="/shop/denim?type=${t}" data-link>
      <img src="/assets/fits/${pic}.png?v=2" alt="Model in ${t} jeans" />
      <span>${t}<i>${f}</i></span>
    </a>`).join("")}</section>`;
}

function shop(cat, sort = "featured", type = "") {
  const label = CATEGORIES.find((c) => c.slug === cat)?.label ?? "Shop all";
  let list = cat ? products.filter((p) => p.categories.includes(cat)) : products.slice();
  const types = [...new Set(list.map((p) => p.type))];
  if (type && types.includes(type)) list = list.filter((p) => p.type === type);
  else type = "";
  const typeHref = (t) => `/shop/${cat}${t ? `?type=${encodeURIComponent(t)}` : ""}`;
  if (sort === "featured") {
    if (cat === "cargos") {
      const orderMap = new Map(CARGO_ORDER.map((h, i) => [h, i]));
      list.sort((a, b) => (orderMap.get(a.handle) ?? 999) - (orderMap.get(b.handle) ?? 999));
    } else if (cat === "pants") {
      const orderMap = new Map(PANTS_ORDER.map((h, i) => [h, i]));
      list.sort((a, b) => (orderMap.get(a.handle) ?? 999) - (orderMap.get(b.handle) ?? 999));
    } else {
      // Studio-shot pieces first, otherwise keep catalogue order.
      const hasModel = (p) => p.images.some((i) => i.includes("-model"));
      list.sort((a, b) => hasModel(b) - hasModel(a));
    }
  }
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
  return `
    ${shopHero(cat, type)}
    <section class="page">
      <h1 class="page-title">${type ? esc(type) : label}</h1>
      <div class="toolbar">
        <nav class="tabs" aria-label="Categories">
          <a href="/shop" data-link class="${!cat ? "active" : ""}">All</a>
          ${CATEGORIES.map((c) => `<a href="/shop/${c.slug}" data-link class="${c.slug === cat ? "active" : ""}">${c.label}</a>`).join("")}
        </nav>
        <div class="toolbar-right">
          <span>${list.length} pieces</span>
          <label><span class="sr-only" hidden>Sort</span>
            <select id="sort" aria-label="Sort products">
              ${SORTS.map(([v, l]) => `<option value="${v}" ${v === sort ? "selected" : ""}>${l}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      ${cat && types.length > 1 ? `<nav class="chips" aria-label="Fits">
        <a href="${typeHref("")}" data-link class="${!type ? "on" : ""}">All ${label.toLowerCase()}</a>
        ${types.map((t) => `<a href="${typeHref(t)}" data-link class="${t === type ? "on" : ""}">${esc(t)}</a>`).join("")}
      </nav>` : ""}
      <div class="grid uy">${list.map(uyCard).join("")}</div>
    </section>
    ${ctMap()}`;
}

// Products page cell: plain grey ground, centred caption, alt image on hover.
function uyCard(p) {
  const [main, alt] = cardImages(p);
  const isModel = Boolean(main && main.includes("-model"));
  return `
    <a class="uy-cell" href="/product/${p.handle}" data-link>
      <div class="uy-media">
        <img src="${main}" class="${isModel ? "img-model" : ""}" alt="${esc(p.name)}" loading="lazy" />
        ${alt ? `<img class="alt" src="${alt}" alt="" loading="lazy" />` : ""}
      </div>
      <p class="uy-cap">${esc(p.type)} <span>${esc(colorOf(p))}</span> ${inr(p.price)}</p>
    </a>`;
}

function product(handle) {
  const p = byHandle.get(handle);
  if (!p) return notFound();
  const related = products.filter((x) => x.handle !== p.handle && x.categories[0] === p.categories[0]);
  const sameType = related.filter((x) => x.type === p.type);
  const picks = [...sameType, ...related.filter((x) => x.type !== p.type)].slice(0, 4);
  const detailRows = [
    ["Style no.", p.styleNo],
    ["Fit", p.fit],
    ["Fabric", p.material],
    ["Colour", colorOf(p)],
  ].filter(([, v]) => v);
  return `
    <section class="pdp">
      <div class="pdp-gallery">
        ${p.images.map((src, i) => `<figure><img src="${src}" alt="${esc(p.name)} — view ${i + 1}" ${i ? 'loading="lazy"' : ""} /></figure>`).join("")}
      </div>
      <div class="pdp-info">
        <p class="eyebrow">${esc(CATEGORIES.find((c) => c.slug === p.categories[0])?.label ?? "")} &nbsp;·&nbsp; ${esc(p.type)}</p>
        <h1>${esc(p.name).replace(/\s*—\s*/, "<br>")}</h1>
        <p class="pdp-price">${inr(p.price)}</p>
        <div class="pdp-label"><span>Size</span><span>${p.sizes.length} available</span></div>
        <div class="sizes" id="sizes">
          ${p.sizes.map((s) => `<button type="button" data-size="${s}">${s}</button>`).join("")}
        </div>
        <button class="btn pdp-add" id="addBtn" type="button" data-handle="${p.handle}" ${p.inStock === false ? "disabled" : ""}>
          ${p.inStock === false ? "Sold out" : "Add to bag"}
        </button>
        <p class="pdp-note" id="addNote" aria-live="polite"></p>
        <p class="pdp-desc">${esc(p.description)}</p>
        <ul class="pdp-details">
          ${detailRows.map(([k, v]) => `<li><span>${k}</span><span>${esc(v)}</span></li>`).join("")}
          <li><span>Shipping</span><span>Free over ₹2,999 · 15-day returns</span></li>
        </ul>
      </div>
    </section>
    ${picks.length ? `
    <section class="section">
      <div class="section-head rv"><h2>You may also like</h2></div>
      <div class="grid">${picks.map(card).join("")}</div>
    </section>` : ""}`;
}

// About: the original site's page, polished — same sections, less text, homepage styling.
function about() {
  const stats = [["2006", "Founded"], ["36 yrs", "Fabric sourcing"], ["8", "States served"], ["100%", "Made in India"]];
  const cloth = [
    ["Rope-dyed indigo", "From our sister mill — depth that fades, not flattens."],
    ["Fit before trend", "Tested on real bodies across four cities."],
    ["Organic & recycled", "A bigger share in every drop."],
  ];
  const values = [
    ["Authenticity", "No borrowed heritage — twenty years of our own patterns and mills."],
    ["Craftsmanship", "Stitch counts, seam finishing and hardware chosen to outlast the season."],
    ["Quality", "Every batch checked twice — once at the mill, once before it ships."],
  ];
  const tick = ["Free Shipping Over ₹2,999", "15-Day Easy Returns", "Made In Delhi Since 2006"]
    .map((t) => `<span class="hr-marquee-item">${t}<span class="hr-marquee-dot" aria-hidden="true">✦</span></span>`).join("");
  return `
    <div class="hr-marquee" aria-hidden="true"><div class="hr-marquee-track">${tick}${tick}${tick}${tick}</div></div>

    <section class="abp-hero">
      <img class="abp-hero-img" data-par="0.08" src="/assets/About1-C60kMP7t.png" alt="Model leaning against a weathered doorway in wide-leg denim" />
      <div class="abp-scrim" aria-hidden="true"></div>
      <div class="abp-hero-copy">
        <p class="hr-eyebrow">Est. 2006 &nbsp;—&nbsp; Delhi</p>
        <h1>About Us</h1>
      </div>
      <p class="abp-hero-lede">A denim label in 2006. A complete menswear brand today — built on fit, fabric and finish.</p>
    </section>

    <section class="abp-stats">
      ${stats.map(([n, l]) => `<div class="abp-stat rv"><span>${l}</span><strong>${n}</strong></div>`).join("")}
    </section>

    <section class="abp-cloth">
    <div class="abp-split">
      <div class="abp-split-img rv"><img src="/assets/About2-2b59lb8O.png" alt="Model walking through a lit store aisle in relaxed denim" loading="lazy" /></div>
      <div class="abp-split-copy">
        <div class="hr-head-main rv"><h2 class="hr-head-title">Denim, worn like it’s yours.</h2></div>
        <p class="hr-head-blurb rv">Decades of textile know-how, and 36 years of fabric sourcing through our sister company, Indigo Multifab.</p>
        <ul class="abp-facts">${cloth.map(([h, c]) => `<li class="rv"><strong>${h}</strong><span>${c}</span></li>`).join("")}</ul>
      </div>
    </div>
    </section>

    <section class="hr-wrap">
      ${head("", "What We Stand For.", "", "", "")}
      <div class="abp-values-grid">
        ${values.map(([h, c]) => `<div class="abp-value rv"><h3>${h}</h3><p>${c}</p></div>`).join("")}
      </div>
    </section>

    <section class="abp-promise">
      <img class="abp-promise-img" src="/assets/denim-banner-rock-Dh8R2dSg.jpg" alt="" aria-hidden="true" loading="lazy" />
      <div class="abp-scrim" aria-hidden="true"></div>
      <div class="abp-promise-copy rv">
        <p class="hr-eyebrow">Our Promise</p>
        <h2>Thoughtfully designed menswear,<br />made to be worn for years.</h2>
        <a href="/shop" class="hr-cta" data-link>Shop The Collection ${arrow}</a>
      </div>
    </section>
    ${ctMap()}`;
}

// Lookbook: the original site's header + index and photo grid, plus three quiet compositions.
const LB_SECTIONS = [
  ["lb-sheet", "Contact Sheet"],
  ["lb-weekend", "The Weekend Look"],
  ["lb-looks", "The Looks"],
  ["lb-grid", "The Grid"],
];
// One strip, shirts and jackets only.
const LB_STRIP = [
  ["home-banner-denim-jacket-DXU6Lkz3.jpg", "Denim Jacket · Coal Grey", "/product/denim-jacket-152-coal-grey", "50% 30%"],
  ["home-banner-corduroy-shirt-D0wu1r0K.jpg", "Corduroy Shirt · Fawn", "/product/corduroy-shirt-141-fawn", "62% 40%"],
  ["About3-B9cmU6sk.png", "Denim Jacket · Tinted Blue", "/product/denim-jacket-164-tinted-blue", "50% 30%"],
  ["Model1-S7237FFC.png", "Corduroy Shirt · Beige", "/product/corduroy-shirt-0041-beige", "50% 22%"],
];

const imgOf = (p, key) => p.images.find((i) => i.includes(key) && !i.includes("-model-back")) || p.images[0];

function lookbookPage() {
  const down = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>`;
  const right = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  const tiles = [
    ["photo", "/assets/lb-tile-r1c1-BYjwopc9.png", ""], ["photo", "/assets/lb-tile-r1c2-CotmQF6v.png", "Model in a chambray shirt"],
    ["product", "/assets/product2-BL2upfSc.png", "Light wash denim western shirt, flat lay", "Shop The Shirt", "/shop/shirts"],
    ["product", "/assets/pant3-BjlOwMkV.png", "Navy trousers, flat lay", "Shop The Trouser", "/shop/pants"],
    ["photo", "/assets/lb-tile-r2c2-iTLHC3r1.png", ""], ["photo", "/assets/lb-tile-r2c3-DfgY3qfA.png", ""],
    ["photo", "/assets/lb-tile-r3c1-CRlmdDXL.png", ""], ["photo", "/assets/lb-tile-r3c2-BWJsaMyL.png", ""], ["photo", "/assets/lb-tile-r3c3-B3sS9bT7.png", ""],
  ];
  const wlTop = byHandle.get("corduroy-jacket-173-brown"), wlBottom = byHandle.get("jazz-3190-black");
  return `
  <div class="lb-page">
    <section class="lb-hero" aria-labelledby="lb-hero-title">
      <div class="lb-hero-copy rv">
        <span class="lb-kicker">Lookbook <i aria-hidden="true">/</i> Winter 2026</span>
        <h1 id="lb-hero-title">The Weekend Edit.</h1>
        <p class="lb-hero-lede">Heavier washes, softer layers. The pieces that carry a Saturday from the porch to the road and back again, shown the way we actually wear them.</p>
        <div class="lb-hero-actions">
          <a href="/shop" class="lb-btn lb-btn-solid" data-link>Shop The Edit ${right}</a>
          <a href="#lb-sheet" class="lb-btn lb-btn-line" data-jump="lb-sheet">See The Looks ${down}</a>
        </div>
      </div>
      <div class="lb-hero-side rv">
        <nav class="lb-contents" aria-label="In this lookbook">
          <span class="lb-contents-label">In this lookbook</span>
          <ol>${LB_SECTIONS.map(([id, label], i) => `<li><a href="#${id}" data-jump="${id}"><em>${pad2(i + 1)}</em><span>${label}</span>${down}</a></li>`).join("")}</ol>
        </nav>
        <p class="lb-hero-meta"><span>Vintage Blue Studio</span><span>@vintageblue.studio</span></p>
      </div>
    </section>

    <section class="lbn-sheet" id="lb-sheet">
      <div class="lbn-wrap">
        <header class="lbn-head rv">
          <span class="lb-kicker">Contact Sheet</span>
          <h2>Shot on the street,<br />picked on the table.</h2>
          <p>Four frames from the shoot — the shirts and jackets of the edit. Tap one to shop it.</p>
        </header>
        <div class="lbs-strip rv">
          ${LB_STRIP.map(([f, cap, to, pos], i) => `
            <a class="lbs-frame" href="${to}" data-link>
              <img src="/assets/${f}" alt="${cap}" loading="lazy" style="object-position:${pos}" />
              <span class="lbs-no">${12 + i}${i % 2 ? "A" : ""}</span>
              <span class="lbs-cap">${cap}</span>
              <span class="lbs-shop">Shop →</span>
            </a>`).join("")}
        </div>
      </div>
    </section>

    <section class="lbw-look" id="lb-weekend" aria-label="The Weekend Look">
      <div class="lbw2 rv">
        <div class="lbw2-info">
          <span class="lb-kicker">The Weekend Look</span>
          <h2>Corduroy,<br />worn dark.</h2>
          <p>A fur-lined corduroy trucker over black comfort denim — the colder end of the weekend.</p>
          <ul class="lbw2-pieces">
            <li><a href="/product/${wlTop.handle}" data-link><span>${esc(wlTop.type)} · ${esc(colorOf(wlTop))}</span><em>${inr(wlTop.price)}</em><b>Shop ${arrow}</b></a></li>
            <li><a href="/product/${wlBottom.handle}" data-link><span>${esc(wlBottom.type)} · ${esc(colorOf(wlBottom))}</span><em>${inr(wlBottom.price)}</em><b>Shop ${arrow}</b></a></li>
          </ul>
        </div>
        <div class="lbw2-figure"><img src="/assets/model2-6q9cesFV.png" alt="Model in a brown corduroy trucker and black Jazz jeans" loading="lazy" /></div>
        <div class="lbw2-crops">
          ${[["The Jacket", "top", wlTop], ["The Collar", "collar", wlTop], ["The Jean", "legs", wlBottom]].map(([label, crop, p]) => `
            <a class="lbw2-crop" href="/product/${p.handle}" data-link>
              <div class="lbw2-crop-img lbw2-${crop}"><img src="/assets/model2-6q9cesFV.png" alt="" aria-hidden="true" loading="lazy" /></div>
              <span class="lbw2-crop-label">${label}</span><span class="lbw2-crop-shop">Shop →</span>
            </a>`).join("")}
        </div>
      </div>
    </section>

    <section class="lbn-looks" id="lb-looks">
      <div class="lbn-wrap">
        <header class="lbn-head rv">
          <span class="lb-kicker">The Looks</span>
          <h2>Two ways to<br />wear the season.</h2>
          <p>Each look broken down piece by piece. Add a single garment, or the whole look in one go.</p>
        </header>
        <div class="stl-anatomy" id="lookbook">${lookbook()}</div>
      </div>
    </section>

    <section class="lb-grid-hero" id="lb-grid" aria-label="The Weekend Edit, photographed">
      <div class="lb-grid-mosaic">
        ${tiles.map(([type, img, alt, label, to]) => type === "product"
          ? `<a href="${to}" class="lb-grid-tile lb-grid-tile-product" data-link><img src="${img}" alt="${alt}" loading="lazy" /><span class="lb-grid-tag">${label}</span></a>`
          : `<div class="lb-grid-tile"${alt ? "" : ' aria-hidden="true"'}><img src="${img}" alt="${alt}" loading="lazy" /></div>`).join("")}
      </div>
      <div class="lb-grid-tint" aria-hidden="true"></div>
      <div class="lb-grid-shade" aria-hidden="true"></div>
      <span class="lb-grid-hint"><span class="lb-grid-hint-dot" aria-hidden="true"></span> The shirt and trouser tiles are shoppable</span>
      <span class="lb-grid-brand"><span class="lb-grid-brand-mark"><span class="script-initial">V</span>intage Blue</span><span class="lb-grid-brand-tag">The Weekend Edit</span></span>
      <a href="/shop" class="lb-grid-cta" data-link>Shop This Look ${right}</a>
    </section>

  </div>`;
}

function bindLookbook() {
  const page = document.querySelector(".lb-page");
  if (!page) return;
  page.addEventListener("click", (e) => {
    const jump = e.target.closest("[data-jump]");
    if (!jump) return;
    e.preventDefault();
    document.getElementById(jump.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function contact() {
  return `
    <section class="page">
      <h1 class="page-title">Contact</h1>
      <div class="contact">
        <div class="rv">
          <p class="eyebrow">Pull up to the studio</p>
          <p style="max-width:440px;color:var(--ink-soft);margin:0 0 40px">Every pair is cut, sewn and washed in Delhi. Come and see where the indigo happens, or write to us any time.</p>
          <dl>
            <div><dt>Studio</dt><dd>Vintage Blue Jeanswear<br />Industrial Area A, Delhi</dd></div>
            <div><dt>Email</dt><dd><a href="mailto:hello@vintageblue.studio">hello@vintageblue.studio</a></dd></div>
            <div><dt>Hours</dt><dd>10am – 6pm IST</dd></div>
          </dl>
          <p style="margin-top:36px"><a class="link-line" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Industrial Area A, Delhi, India")}" target="_blank" rel="noopener">Get directions <span aria-hidden="true">↗</span></a></p>
        </div>
        <div class="contact-media rv"><img src="${IMG.contact}" alt="Model in super-baggy denim" loading="lazy" /></div>
      </div>
    </section>`;
}

function notFound() {
  return `
    <section class="page"><div class="empty">
      <h1>Not found.</h1>
      <p>That page has moved or never existed.</p>
      <p style="margin-top:28px"><a class="link-line" href="/shop" data-link>Back to the shop</a></p>
    </div></section>`;
}

/* ---------- Router ---------- */

function render() {
  const url = new URL(location.href);
  const parts = url.pathname.split("/").filter(Boolean);
  let html;
  if (parts[0] === "dark") html = home();
  else if (!parts.length || parts[0] === "home2") html = home2();
  else if (/^about[2-7]$/.test(parts[0] || "")) html = { about2, about3, about4, about5, about6, about7 }[parts[0]]();
  else if ((parts[0] === "shop" || parts[0] === "category") && (!parts[1] || CATEGORIES.some((c) => c.slug === parts[1])))
    html = shop(parts[1], url.searchParams.get("sort") || "featured", url.searchParams.get("type") || "");
  else if (parts[0] === "product" && parts[1]) html = product(parts[1]);
  else if (parts[0] === "about") html = about();
  else if (parts[0] === "contact") html = contact();
  else if (/^contact([2-9]|1[01])$/.test(parts[0] || "")) html = { contact2, contact3, contact4, contact5, contact6, contact7, contact8, contact9, contact10, contact11 }[parts[0]]();
  else if (parts[0] === "lookbook") html = lookbookPage();
  else if (/^lookbook([2-9]|10)$/.test(parts[0] || "")) html = { lookbook2, lookbook3, lookbook4, lookbook5, lookbook6, lookbook7, lookbook8, lookbook9, lookbook10 }[parts[0]]();
  else html = notFound();

  app.innerHTML = html;
  document.body.classList.toggle("dark", parts[0] === "dark");
  const v2 = !parts.length || parts[0] === "home2" || parts[0] === "shop" || parts[0] === "category" || /^contact([2-9]|1[01])$/.test(parts[0] || "") || /^(about[2-7]|lookbook([2-9]|10))$/.test(parts[0] || "");
  document.body.classList.toggle("h2", v2);
  document.body.classList.toggle("h2dark", parts[0] === "lookbook9" || parts[0] === "contact11");
  // On the v2 pages the wordmark and About link stay within v2.
  document.querySelector(".nav-mark").setAttribute("href", v2 ? "/home2" : "/");
  document.querySelector('.nav-links a[href^="/about"]').setAttribute("href", v2 ? "/about7" : "/about");
  document.querySelector('.nav-links a[href^="/lookbook"]').setAttribute("href", v2 ? "/lookbook10" : "/lookbook");
  document.querySelector('.nav-links a[href^="/contact"]').setAttribute("href", v2 ? "/contact11" : "/contact");
  document.title = titleFor(parts);
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.toggle("active", "/" + parts[0] === a.getAttribute("href"));
  });
  closeMenu();
  bindPage();
  observeReveals();
  onScroll();
}

function titleFor(parts) {
  if (parts[0] === "product") {
    const p = byHandle.get(parts[1]);
    if (p) return `${p.name} — Vintage Blue`;
  }
  if (parts[0] === "shop" || parts[0] === "category") return `${CATEGORIES.find((c) => c.slug === parts[1])?.label ?? "Shop"} — Vintage Blue`;
  if (/^about[2-7]?$/.test(parts[0] || "")) return "About — Vintage Blue";
  if (/^contact([2-9]|1[01])?$/.test(parts[0] || "")) return "Contact — Vintage Blue";
  if (/^lookbook([2-9]|10)?$/.test(parts[0] || "")) return "Lookbook — Vintage Blue";
  return "Vintage Blue";
}

function go(href) {
  history.pushState(null, "", href);
  render();
  window.scrollTo(0, 0);
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
  e.preventDefault();
  closeBag();
  go(a.getAttribute("href"));
});
window.addEventListener("popstate", render);

function animateLook() {
  const cell = document.getElementById("lookCell");
  if (!cell) return;
  if (reduceMotion) return cell.classList.add("in");
  const io2 = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (cell.classList.add("in"), io2.disconnect())), { threshold: 0.12 });
  io2.observe(cell);
}

function flash(btn, html, ms) {
  const before = btn.innerHTML;
  btn.innerHTML = html;
  btn.classList.add("added");
  setTimeout(() => { btn.innerHTML = before; btn.classList.remove("added"); }, ms);
}

function bindPage() {
  bindLookbook();
  bindHome2();
  bindAbout7();
  bindLookbook8();
  bindContact2();
  bindContactTiles();
  const lb = document.getElementById("lookbook");
  if (lb) {
    animateLook();
    lb.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-look]");
      const one = e.target.closest("[data-add]");
      const all = e.target.closest("[data-add-all]");
      if (nav) {
        lookIndex = (lookIndex + +nav.dataset.look + LOOKS.length) % LOOKS.length;
        lb.innerHTML = lookbook();
        requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById("lookCell").classList.add("in")));
      } else if (one) {
        addToBag(one.dataset.add, "M");
        flash(one, `${tick} Added`, 1800);
      } else if (all) {
        all.dataset.addAll.split(",").forEach((h) => addToBag(h, "M"));
        flash(all, `${tick} Both added · size M`, 2400);
      }
    });
  }

  document.querySelectorAll("video[autoplay]").forEach((v) => {
    v.muted = true;
    v.play().catch(() => {});
  });


  const sort = document.getElementById("sort");
  if (sort) {
    sort.addEventListener("change", () => {
      const u = new URL(location.href);
      sort.value === "featured" ? u.searchParams.delete("sort") : u.searchParams.set("sort", sort.value);
      history.replaceState(null, "", u.pathname + u.search);
      render();
    });
  }

  const sizes = document.getElementById("sizes");
  const add = document.getElementById("addBtn");
  if (sizes && add) {
    let chosen = null;
    const note = document.getElementById("addNote");
    sizes.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-size]");
      if (!b) return;
      chosen = b.dataset.size;
      sizes.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      note.textContent = "";
    });
    add.addEventListener("click", () => {
      if (!chosen) {
        note.textContent = "Choose a size first.";
        return;
      }
      addToBag(add.dataset.handle, chosen);
      note.textContent = "";
      openBag();
    });
  }
}

/* ---------- Scroll effects ---------- */

let io;
function observeReveals() {
  io?.disconnect();
  io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add("in"), io.unobserve(en.target))),
    { rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));
}

// Hero + video parallax, mirroring the original site's motion.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
function onScroll() {
  nav.classList.toggle("solid", window.scrollY > 8);
  if (reduceMotion) return;
  const y = Math.min(window.scrollY, 900);
  document.querySelectorAll("[data-par]").forEach((el) => {
    el.style.transform = `translate3d(0, ${y * +el.dataset.par}px, 0)`;
    if (el.hasAttribute("data-fade")) el.style.opacity = Math.max(0, 1 - y / 560);
  });
  document.querySelectorAll("[data-par-rel]").forEach((el) => {
    const r = el.parentElement.getBoundingClientRect();
    const off = r.top + r.height / 2 - innerHeight / 2;
    el.style.transform = `translate3d(0, ${-off * +el.dataset.parRel}px, 0)`;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Mobile menu ---------- */

const menuBtn = document.getElementById("menuBtn");
function closeMenu() {
  nav.classList.remove("menu-open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.textContent = "Menu";
}
menuBtn.addEventListener("click", () => {
  const open = !nav.classList.contains("menu-open");
  nav.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Close" : "Menu";
});

/* ---------- Bag ---------- */

const KEY = "vb-bag";
let bag = [];
try {
  bag = JSON.parse(localStorage.getItem(KEY) || "[]");
} catch {
  bag = [];
}
let checkedOut = false;

function saveBag() {
  try {
    localStorage.setItem(KEY, JSON.stringify(bag));
  } catch {}
  renderBag();
}

function addToBag(handle, size) {
  const line = bag.find((l) => l.handle === handle && l.size === size);
  line ? line.qty++ : bag.push({ handle, size, qty: 1 });
  checkedOut = false;
  saveBag();
}

const bagEl = document.getElementById("bag");
const scrim = document.getElementById("bagScrim");
function openBag() {
  bagEl.classList.add("open");
  bagEl.setAttribute("aria-hidden", "false");
  scrim.hidden = false;
  document.getElementById("bagClose").focus();
}
function closeBag() {
  bagEl.classList.remove("open");
  bagEl.setAttribute("aria-hidden", "true");
  scrim.hidden = true;
}
document.getElementById("bagOpen").addEventListener("click", openBag);
document.getElementById("bagClose").addEventListener("click", closeBag);
scrim.addEventListener("click", closeBag);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeBag());

function renderBag() {
  const lines = bag.map((l) => ({ ...l, p: byHandle.get(l.handle) })).filter((l) => l.p);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.p.price, 0);
  document.getElementById("bagCount").textContent = count;
  const body = document.getElementById("bagBody");
  const foot = document.getElementById("bagFoot");

  if (checkedOut) {
    body.innerHTML = `<div class="bag-done"><h3>Thank you.</h3><p>Your order is confirmed. This is a demo checkout, so nothing was charged.</p><a class="link-line" href="/shop" data-link>Keep browsing</a></div>`;
    foot.innerHTML = "";
    return;
  }
  if (!lines.length) {
    body.innerHTML = `<div class="bag-empty"><p>Your bag is empty.</p><a class="link-line" href="/shop" data-link>Start with denim</a></div>`;
    foot.innerHTML = "";
    return;
  }
  body.innerHTML = lines
    .map(
      (l, i) => `
      <div class="bag-item">
        <img src="${cardImages(l.p)[0]}" alt="" />
        <div>
          <h3>${esc(l.p.type)}</h3>
          <p>${esc(colorOf(l.p))} · Size ${esc(l.size)}</p>
          <div class="bag-row">
            <div class="qty">
              <button type="button" data-q="${i}" data-d="-1" aria-label="Decrease quantity">−</button>
              <span>${l.qty}</span>
              <button type="button" data-q="${i}" data-d="1" aria-label="Increase quantity">+</button>
            </div>
            <span>${inr(l.qty * l.p.price)}</span>
          </div>
          <p style="margin:10px 0 0"><button type="button" class="bag-remove" data-r="${i}">Remove</button></p>
        </div>
      </div>`
    )
    .join("");
  foot.innerHTML = `
    <div class="bag-total"><span>Subtotal</span><span>${inr(total)}</span></div>
    <p class="bag-ship">${total >= 2999 ? "Free shipping on this order." : `Add ${inr(2999 - total)} more for free shipping.`}</p>
    <button class="btn" type="button" id="checkout">Checkout</button>`;
}

document.getElementById("bagBody").addEventListener("click", (e) => {
  const q = e.target.closest("[data-q]");
  const r = e.target.closest("[data-r]");
  if (q) {
    const line = bag[+q.dataset.q];
    line.qty += +q.dataset.d;
    if (line.qty < 1) bag.splice(+q.dataset.q, 1);
    saveBag();
  } else if (r) {
    bag.splice(+r.dataset.r, 1);
    saveBag();
  }
});
document.getElementById("bagFoot").addEventListener("click", (e) => {
  if (e.target.id !== "checkout") return;
  bag = [];
  checkedOut = true;
  saveBag();
});

/* ---------- Newsletter ---------- */

document.getElementById("subForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.querySelector(".foot-sub-row").hidden = true;
  document.getElementById("subDone").hidden = false;
});

/* ---------- Boot ---------- */

fetch("/data/products.json?v=89")
  .then((r) => r.json())
  .then((data) => {
    products = data;
    data.forEach((p) => byHandle.set(p.handle, p));
    renderBag();
    render();
  });
