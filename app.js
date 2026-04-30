const state = {
  view: "slideshow",
  currentSlide: 0,
  currentDoc: 0,
  zoomOpen: false,
  zoom: 1,
};

const els = {
  tabButtons: document.querySelectorAll(".tab-btn"),
  views: {
    slideshow: document.querySelector("#slideshow-view"),
    documents: document.querySelector("#documents-view"),
    downloads: document.querySelector("#downloads-view"),
  },
  activeSlide: document.querySelector("#active-slide"),
  activeSlideTitle: document.querySelector("#active-slide-title"),
  slideNum: document.querySelector("#slide-num"),
  slideCount: document.querySelector("#slide-count"),
  prevSlide: document.querySelector("#prev-slide"),
  nextSlide: document.querySelector("#next-slide"),
  thumbStrip: document.querySelector("#thumb-strip"),
  dots: document.querySelector("#dots"),
  docTabs: document.querySelector("#doc-tabs"),
  docContent: document.querySelector("#doc-content"),
  downloadGrid: document.querySelector("#download-grid"),
  zoomModal: document.querySelector("#zoom-modal"),
  zoomOpen: document.querySelector("#zoom-open"),
  zoomClose: document.querySelector("#zoom-close"),
  zoomImg: document.querySelector("#zoom-img"),
  zoomTitle: document.querySelector("#zoom-title"),
  zoomIn: document.querySelector("#zoom-in"),
  zoomOut: document.querySelector("#zoom-out"),
  zoomReset: document.querySelector("#zoom-reset"),
  zoomLevel: document.querySelector("#zoom-level"),
  zoomCanvas: document.querySelector("#zoom-canvas"),
};

function setView(view) {
  state.view = view;
  els.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  Object.entries(els.views).forEach(([name, section]) => {
    section.classList.toggle("visible", name === view);
  });
}

function setSlide(index) {
  if (index < 0 || index >= SLIDES.length) return;
  state.currentSlide = index;
  const slide = SLIDES[index];
  els.activeSlide.src = slide.src;
  els.activeSlide.alt = slide.title;
  els.activeSlide.classList.remove("entering");
  requestAnimationFrame(() => els.activeSlide.classList.add("entering"));
  els.activeSlideTitle.textContent = slide.title;
  els.slideNum.textContent = `${index + 1} / ${SLIDES.length}`;
  els.slideCount.textContent = `${index + 1} / ${SLIDES.length}`;
  els.prevSlide.disabled = index === 0;
  els.nextSlide.disabled = index === SLIDES.length - 1;

  document.querySelectorAll(".thumb").forEach((thumb, thumbIndex) => {
    thumb.classList.toggle("active", thumbIndex === index);
  });
  document.querySelectorAll(".dot-btn").forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === index);
  });

  const activeThumb = els.thumbStrip.querySelectorAll(".thumb")[index];
  if (activeThumb) activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });

  if (state.zoomOpen) updateZoomImage();
}

function renderSlideNav() {
  els.thumbStrip.innerHTML = "";
  els.dots.innerHTML = "";

  SLIDES.forEach((slide, index) => {
    const thumb = document.createElement("button");
    thumb.className = "thumb";
    thumb.type = "button";
    thumb.title = slide.title;
    thumb.innerHTML = `<img src="${slide.src}" alt="Slide ${index + 1}" />`;
    thumb.addEventListener("click", () => setSlide(index));
    els.thumbStrip.appendChild(thumb);

    const dot = document.createElement("button");
    dot.className = "dot-btn";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => setSlide(index));
    els.dots.appendChild(dot);
  });
}

function renderDocuments() {
  els.docTabs.innerHTML = "";
  DOCUMENTS.forEach((doc, index) => {
    const button = document.createElement("button");
    button.className = "doc-tab";
    button.type = "button";
    button.textContent = doc.title;
    button.addEventListener("click", () => setDocument(index));
    els.docTabs.appendChild(button);
  });
  setDocument(state.currentDoc);
}

function setDocument(index) {
  state.currentDoc = index;
  const doc = DOCUMENTS[index];
  document.querySelectorAll(".doc-tab").forEach((tab, tabIndex) => {
    tab.classList.toggle("active", tabIndex === index);
  });

  const sections = doc.sections
    .map((section) => {
      const body = section.list
        ? `<ol>${section.list.map((item) => `<li>${item}</li>`).join("")}</ol>`
        : section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
      return `<section class="doc-section"><h3>${section.heading}</h3>${body}</section>`;
    })
    .join("");

  els.docContent.innerHTML = `
    <div class="doc-header">
      <div class="doc-eyebrow">${doc.eyebrow}</div>
      <h2>${doc.title}</h2>
      <div class="doc-byline">${doc.byline}</div>
    </div>
    ${sections}
  `;
}

function renderDownloads() {
  els.downloadGrid.innerHTML = DOWNLOADS.map(
    (file) => `
      <article class="download-card">
        <div class="download-type">${file.type}</div>
        <h3>${file.title}</h3>
        <p>${file.description}</p>
        <a href="${file.href}" download>Download File</a>
      </article>
    `
  ).join("");
}

function updateZoomImage() {
  const slide = SLIDES[state.currentSlide];
  els.zoomImg.src = slide.src;
  els.zoomImg.alt = `${slide.title} zoomed`;
  els.zoomTitle.textContent = slide.title;
}

function updateZoomLevel() {
  els.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
  els.zoomCanvas.style.setProperty("--zoom-width", `${90 * state.zoom}vw`);
  els.zoomOut.disabled = state.zoom <= 1;
  els.zoomIn.disabled = state.zoom >= 3;
}

function openZoom() {
  state.zoomOpen = true;
  state.zoom = 1;
  updateZoomImage();
  updateZoomLevel();
  els.zoomModal.hidden = false;
}

function closeZoom() {
  state.zoomOpen = false;
  els.zoomModal.hidden = true;
}

function changeZoom(amount) {
  state.zoom = Math.min(3, Math.max(1, Number((state.zoom + amount).toFixed(2))));
  updateZoomLevel();
}

function bindEvents() {
  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  els.prevSlide.addEventListener("click", () => setSlide(state.currentSlide - 1));
  els.nextSlide.addEventListener("click", () => setSlide(state.currentSlide + 1));
  els.zoomOpen.addEventListener("click", openZoom);
  els.zoomClose.addEventListener("click", closeZoom);
  els.zoomIn.addEventListener("click", () => changeZoom(0.25));
  els.zoomOut.addEventListener("click", () => changeZoom(-0.25));
  els.zoomReset.addEventListener("click", () => {
    state.zoom = 1;
    updateZoomLevel();
  });

  window.addEventListener("keydown", (event) => {
    if (state.zoomOpen) {
      if (event.key === "Escape") closeZoom();
      if (event.key === "+" || event.key === "=") changeZoom(0.25);
      if (event.key === "-" || event.key === "_") changeZoom(-0.25);
      return;
    }
    if (state.view !== "slideshow") return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") setSlide(state.currentSlide + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") setSlide(state.currentSlide - 1);
  });
}

renderSlideNav();
renderDocuments();
renderDownloads();
bindEvents();
setSlide(0);
