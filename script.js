const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Theme toggle (remembers choice)
const root = document.documentElement;
const saved = localStorage.getItem("theme");
if (saved) root.dataset.theme = saved;
$("#themeToggle").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("theme", next);
});

// Scroll reveal
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
$$(".reveal").forEach((el) => io.observe(el));

$("#year").textContent = new Date().getFullYear();

// Mobile menu
const nav = $("#mainNav"), menuBtn = $("#menuToggle");
const setMenu = (open) => {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.textContent = open ? "✕" : "☰";
};
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
$$("#mainNav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Typing effect
const phrases = ["bench management.", "resource utilization.", "delivery tracking.", "stakeholder alignment.", "analysis with Python & SQL."];
const typed = $("#typed");
if (reduceMotion) {
  typed.textContent = phrases[0];
} else {
  let p = 0, c = 0, del = false;
  (function tick() {
    const word = phrases[p];
    typed.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && c === 0) { del = false; p = (p + 1) % phrases.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 70);
  })();
}

// Scroll progress, back-to-top, active nav link
const bar = $("#progress"), toTop = $("#toTop");
const links = $$("#mainNav a[href^='#']:not(.btn)");
const sections = links.map((a) => $(a.getAttribute("href")));
function onScroll() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  toTop.classList.toggle("show", h.scrollTop > 600);
  const y = h.scrollTop + 120;
  let cur = -1;
  sections.forEach((s, i) => { if (s.offsetTop <= y) cur = i; });
  links.forEach((a, i) => a.classList.toggle("active", i === cur));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

// Count-up stats
const counters = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  counters.unobserve(e.target);
  if (reduceMotion) return;
  const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
  const t0 = performance.now();
  (function step(t) {
    const k = Math.min((t - t0) / 1000, 1);
    el.textContent = Math.round(end * k) + (k === 1 ? suf : "");
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}), { threshold: 0.6 });
$$("[data-count]").forEach((el) => counters.observe(el));

// Photo tilt (pointer devices only)
const tilt = $("#heroPhoto");
if (!reduceMotion && matchMedia("(hover: hover)").matches) {
  tilt.addEventListener("pointermove", (e) => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  tilt.addEventListener("pointerleave", () => (tilt.style.transform = ""));
}

// Project filters
$$("#filters .chip-btn").forEach((btn) => btn.addEventListener("click", () => {
  $$("#filters .chip-btn").forEach((b) => b.classList.toggle("active", b === btn));
  const f = btn.dataset.filter;
  $$(".project").forEach((card) => {
    card.hidden = !(f === "all" || card.dataset.tags.split(" ").includes(f));
    card.classList.add("visible");
  });
}));

// Experience cards: click to collapse / expand
$$(".tl-item").forEach((item) => {
  if ($("ul", item).children.length < 3) return;
  const toggle = () => {
    item.classList.toggle("collapsed");
    item.setAttribute("aria-expanded", !item.classList.contains("collapsed"));
  };
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.setAttribute("aria-expanded", "true");
  item.title = "Click to collapse / expand";
  item.addEventListener("click", toggle);
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  });
});

// Photo lightbox
const lb = $("#lightbox"), lbImg = $("#lbImg"), shots = $$(".g-item");
let idx = 0;
const show = (i) => {
  idx = (i + shots.length) % shots.length;
  lbImg.src = shots[idx].dataset.full;
  lbImg.alt = $("img", shots[idx]).alt;
};
const openLb = (i) => { show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus(); };
const closeLb = () => { lb.hidden = true; document.body.style.overflow = ""; shots[idx].focus(); };
shots.forEach((s, i) => s.addEventListener("click", () => openLb(i)));
$("#lbClose").addEventListener("click", closeLb);
$("#lbPrev").addEventListener("click", () => show(idx - 1));
$("#lbNext").addEventListener("click", () => show(idx + 1));
lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") show(idx - 1);
  if (e.key === "ArrowRight") show(idx + 1);
});
