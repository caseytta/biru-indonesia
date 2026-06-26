/* ============================================================
   BIRU INDONESIA — home.js
   Tambahan khusus landing page. Logic umum (navbar, hamburger,
   scroll reveal, gallery) tetap ditangani script.js.

   Isi:
   1. Counter — angka statistik menghitung naik saat terlihat
   2. Reveal tambahan untuk elemen landing page
============================================================ */


/* ─────────────────────────────────────
   1. COUNTER STATISTIK
───────────────────────────────────── */
function initStatsCounter() {
  const nums = document.querySelectorAll('.stats__num');
  if (!nums.length) return;

  function animate(el) {
    const target  = parseInt(el.getAttribute('data-count'), 10) || 0;
    const suffix  = el.getAttribute('data-suffix') || '';
    const duration = 1400;            // ms
    const start    = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic biar smooth di akhir
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);  // cukup sekali
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
}


/* ─────────────────────────────────────
   2. REVEAL TAMBAHAN (landing page sections)
   script.js sudah punya IntersectionObserver untuk .reveal,
   tapi target selectornya khusus halaman product. Di sini kita
   daftarkan elemen landing page agar ikut fade-in.
───────────────────────────────────── */
function initHomeReveal() {
  const targets = document.querySelectorAll(
    '.help__card, .sector, .story__block, .why__item, ' +
    '.stats__item, .product-card, .gallery__card, .inspirasi__card'
  );
  if (!targets.length) return;

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}



/* ─────────────────────────────────────
   HERO SLIDER / CAROUSEL
   - Geser horizontal antar slide
   - Auto-slide tiap 5 detik
   - Panah kiri/kanan + dot indikator
   - Pause saat hover / saat tab tidak aktif
   - Loop tak terbatas
───────────────────────────────────── */
function initHeroSlider() {
  const slider  = document.getElementById('heroSlider');
  const track   = document.getElementById('heroTrack');
  const dotsBox = document.getElementById('heroDots');
  if (!slider || !track) return;
 
  const realSlides = Array.from(track.children);
  const total = realSlides.length;
  if (total <= 1) return;
 
  const INTERVAL = 5000;
  const SPEED_MS = 700;            // harus sama dengan transition di CSS
 
  // ── Klon slide pertama, taruh di belakang (slide "bayangan") ──
  // Supaya saat dari slide terakhir balik ke slide 1, track tetap maju ke kanan.
  const clone = realSlides[0].cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.appendChild(clone);
 
  // Lebar track & tiap slide diatur dinamis: track = (total+1) × 100%,
  // tiap slide = bagian yang sama. Geser pakai persentase dari TRACK.
  const slideCount = total + 1;
  track.style.width = (slideCount * 100) + '%';
  Array.from(track.children).forEach(s => {
    s.style.flex = `0 0 ${100 / slideCount}%`;
    s.style.width = (100 / slideCount) + '%';
  });
 
  let current = 0;
  let timer = null;
  let isAnimating = false;
 
  // ── Dot: sebanyak slide ASLI saja ──
  const dots = [];
  if (dotsBox) {
    realSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero-slider__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', () => { goTo(i); resetTimer(); });
      dotsBox.appendChild(dot);
      dots.push(dot);
    });
  }
 
  // Tiap slide selebar 100%/(total+1) dari track; geser = current slide.
  function applyTransform(animate) {
    const slideCount = total + 1;
    track.style.transition = animate ? `transform ${SPEED_MS}ms cubic-bezier(.65,.05,.36,1)` : 'none';
    track.style.transform = `translateX(-${current * (100 / slideCount)}%)`;
  }
 
  function setActiveDot() {
    // Saat di klon (current === total), dot yang nyala = dot pertama (0)
    const realIndex = current % total;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === realIndex));
  }
 
  function goTo(index) {
    if (isAnimating) return;
    current = index;
    isAnimating = true;
    applyTransform(true);
    setActiveDot();
  }
 
  // SELALU MAJU (geser kanan)
  function next() {
    if (isAnimating) return;
    current += 1;
    isAnimating = true;
    applyTransform(true);
    setActiveDot();
  }
 
  // Mundur (hanya dari panah kiri, opsional). Kalau di slide 0, lompat dulu
  // ke posisi klon tanpa animasi supaya tetap bisa mundur mulus.
  function prev() {
    if (isAnimating) return;
    if (current === 0) {
      current = total;             // pindah ke klon (visual sama dgn slide 1)
      applyTransform(false);
      // paksa reflow agar 'none' diterapkan sebelum animasi berikut
      void track.offsetWidth;
    }
    current -= 1;
    isAnimating = true;
    applyTransform(true);
    setActiveDot();
  }
 
  // Setelah transisi selesai: kalau di klon, teleport diam-diam ke slide 1 asli
  track.addEventListener('transitionend', () => {
    isAnimating = false;
    if (current === total) {       // sampai di klon
      current = 0;
      applyTransform(false);       // lompat tanpa animasi ke slide 1 asli
    }
  });
 
  function startTimer() { timer = setInterval(next, INTERVAL); }
  function stopTimer()  { clearInterval(timer); timer = null; }
  function resetTimer() { stopTimer(); startTimer(); }
 
  const btnPrev = document.getElementById('heroPrev');
  const btnNext = document.getElementById('heroNext');
  if (btnPrev) btnPrev.addEventListener('click', () => { prev(); resetTimer(); });
  if (btnNext) btnNext.addEventListener('click', () => { next(); resetTimer(); });
 
  slider.addEventListener('mouseenter', stopTimer);
  slider.addEventListener('mouseleave', startTimer);
 
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopTimer() : resetTimer();
  });
 
  // Swipe: geser kiri = next (maju), geser kanan = prev
  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetTimer(); }
  }, { passive: true });
 
  applyTransform(false);           // posisi awal
  startTimer();
}
 

/* ─────────────────────────────────────
   INIT
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStatsCounter();
  initHomeReveal();
  initHeroSlider();
});
