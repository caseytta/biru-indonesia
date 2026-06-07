/* ============================================================
   BIRU INDONESIA — script.js
   Struktur:
   1. Navbar — transparent on hero, solid on scroll
   2. Hamburger — mobile menu toggle
   3. Scroll Reveal — IntersectionObserver
   4. Gallery — drag-to-scroll + arrow buttons
   5. Form Validation
   6. Init
============================================================ */


/* ─────────────────────────────────────
   1. NAVBAR
───────────────────────────────────── */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const hero     = document.querySelector('.hero');

  if (!navbar) return;

  function updateNavbar() {
    // Kalau ada hero section, navbar transparan saat di atasnya
    if (hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      if (window.scrollY < heroBottom - 80) {
        navbar.classList.add('navbar--transparent');
      } else {
        navbar.classList.remove('navbar--transparent');
      }
    }
  }

  // Jalankan sekali saat load, lalu listen scroll
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });
}


/* ─────────────────────────────────────
   2. HAMBURGER — MOBILE MENU
───────────────────────────────────── */
function initHamburger() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');

    mobileMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', !isOpen);
  });

  // Tutup menu kalau klik link di dalamnya
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Tutup menu kalau klik di luar
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      mobileMenu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
    }
  });
}


/* ─────────────────────────────────────
   3. SCROLL REVEAL
   Elemen dengan class .reveal akan fade-in
   saat masuk viewport. Tambahkan .reveal-stagger
   ke parent untuk animasi berurutan per anak.
───────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.about__grid, .features__item, .specs__block, ' +
    '.video-main, .video-thumb, .cta__left, .cta__form-card, ' +
    '.gallery__card, .footer__grid > *'
  );

  // Tambahkan class reveal ke semua elemen target
  elements.forEach(el => el.classList.add('reveal'));

  // Tambahkan reveal-stagger ke parent features grid
  const featuresGrid = document.querySelector('.features__grid');
  if (featuresGrid) featuresGrid.classList.add('reveal-stagger');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Unobserve setelah visible — animasi cukup sekali
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,      // trigger saat 12% elemen terlihat
    rootMargin: '0px 0px -40px 0px'  // sedikit sebelum batas bawah viewport
  });

  elements.forEach(el => observer.observe(el));
}


/* ─────────────────────────────────────
   4. GALLERY — DRAG TO SCROLL + ARROWS
───────────────────────────────────── */
function initGallery() {
  const track = document.getElementById('galleryTrack');
  const btnPrev = document.getElementById('galleryPrev');
  const btnNext = document.getElementById('galleryNext');

  if (!track) return;

  // ── Arrow buttons ──
  const SCROLL_AMOUNT = 350; // px per klik

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    });
  }

  // Sembunyikan/tampilkan panah sesuai posisi scroll
  function updateArrows() {
    if (!btnPrev || !btnNext) return;

    btnPrev.style.opacity = track.scrollLeft <= 10 ? '0.35' : '1';
    btnPrev.style.pointerEvents = track.scrollLeft <= 10 ? 'none' : 'auto';

    const maxScroll = track.scrollWidth - track.clientWidth;
    btnNext.style.opacity = track.scrollLeft >= maxScroll - 10 ? '0.35' : '1';
    btnNext.style.pointerEvents = track.scrollLeft >= maxScroll - 10 ? 'none' : 'auto';
  }

  track.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows(); // Cek state awal

  // ── Drag to scroll (mouse) ──
  let isDown   = false;
  let startX   = 0;
  let scrollLeft = 0;
  let hasDragged = false;

  track.addEventListener('mousedown', (e) => {
    isDown     = true;
    hasDragged = false;
    startX     = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.userSelect = 'none';
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.userSelect = '';
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.userSelect = '';
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5; // 1.5 = kecepatan drag
    track.scrollLeft = scrollLeft - walk;

    if (Math.abs(walk) > 5) hasDragged = true;
  });

  // Cegah klik link saat drag
  track.querySelectorAll('a, .gallery__card').forEach(el => {
    el.addEventListener('click', (e) => {
      if (hasDragged) e.preventDefault();
    });
  });

  // ── Touch swipe (mobile) ──
  let touchStartX = 0;
  let touchScrollLeft = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX    = e.touches[0].pageX;
    touchScrollLeft = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    const x    = e.touches[0].pageX;
    const walk = (touchStartX - x) * 1.2;
    track.scrollLeft = touchScrollLeft + walk;
  }, { passive: true });
}


/* ─────────────────────────────────────
   5. FORM VALIDATION
───────────────────────────────────── */
function handleSubmitSuccess(btn, form) {
  // Loading state
  btn.textContent = 'Mengirim...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  // Simulasi delay (hapus ini saat pakai Tally / API real)
  setTimeout(() => {
    // Tampilkan pesan sukses
    form.innerHTML = `
      <div class="form-success">
        <div class="form-success__icon">✓</div>
        <h3>Terima kasih!</h3>
        <p>Data kamu sudah kami terima. E-Katalog akan dikirim ke email kamu dalam 1×24 jam.</p>
        <p style="margin-top:8px; font-size:.85rem; color:#94a3b8;">
          Butuh respons lebih cepat? 
          <a href="https://wa.me/6281510263893" style="color:#60a5fa;">Chat via WhatsApp ↗</a>
        </p>
      </div>
    `;

    // Style pesan sukses — inject inline supaya tidak perlu tambah CSS
    const style = document.createElement('style');
    style.textContent = `
      .form-success {
        text-align: center;
        padding: 32px 16px;
        animation: fadeInUp .5s ease-out;
      }
      .form-success__icon {
        width: 56px; height: 56px; border-radius: 50%;
        background: rgba(34,197,94,.15);
        border: 2px solid rgba(34,197,94,.4);
        color: #4ade80; font-size: 1.6rem;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 20px;
      }
      .form-success h3 { color: #fff; margin-bottom: 10px; font-size: 1.3rem; }
      .form-success p  { color: #94a3b8; font-size: .9rem; line-height: 1.6; }
    `;
    document.head.appendChild(style);
  }, 1200);
}


/* ─────────────────────────────────────
   6. INIT — jalankan semua saat DOM siap
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initScrollReveal();
  initGallery();
});
