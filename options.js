// Hero options deck.
const slides = [...document.querySelectorAll(".slide")];
let cur = 0;
try { cur = Math.min(slides.length - 1, Math.max(0, +(location.hash.slice(1) || 1) - 1)); } catch {}

function show(i) {
  cur = (i + slides.length) % slides.length;
  slides.forEach((s, k) => s.classList.toggle("active", k === cur));
  document.getElementById("deckCount").textContent = `${cur + 1} / ${slides.length}`;
  document.getElementById("deckLabel").textContent = slides[cur].dataset.label;
  history.replaceState(null, "", "#" + (cur + 1));
  slides[cur].querySelectorAll("video").forEach((v) => { v.muted = true; v.play().catch(() => {}); });
}
document.getElementById("prev").onclick = () => show(cur - 1);
document.getElementById("next").onclick = () => show(cur + 1);
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") show(cur + 1);
  if (e.key === "ArrowLeft") show(cur - 1);
});
show(cur);

// Option 03: a live countdown to a sample drop date (Friday, 6pm).
const box = document.getElementById("h03Count");
if (box) {
  const target = new Date();
  target.setDate(target.getDate() + ((5 - target.getDay() + 7) % 7 || 7));
  target.setHours(18, 0, 0, 0);
  const tick = () => {
    let t = Math.max(0, target - Date.now()) / 1000;
    const parts = [Math.floor(t / 86400), Math.floor((t % 86400) / 3600), Math.floor((t % 3600) / 60), Math.floor(t % 60)];
    box.innerHTML = parts.map((n, i) => `<span>${String(n).padStart(2, "0")}<em>${"DHMS"[i]}</em></span>`).join("");
  };
  tick();
  setInterval(tick, 1000);
}
