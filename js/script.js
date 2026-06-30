function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const hero     = document.querySelector('.hero, .hero-slider');

  if (!navbar) return;

  function updateNavbar() {
    if (hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      if (window.scrollY < heroBottom - 80) {
        navbar.classList.add('navbar--transparent');
      } else {
        navbar.classList.remove('navbar--transparent');
      }
    }
  }

  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });
}


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

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
  const navbarEl = document.getElementById('navbar');
  document.addEventListener('click', (e) => {
    if (navbarEl && !navbarEl.contains(e.target)) {
      mobileMenu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
    }
  });
}


function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.about__grid, .features__item, .specs__block, ' +
    '.video-main, .video-thumb, .cta__left, .cta__form-card, ' +
    '.gallery__card, .footer__grid > *'
  );

  elements.forEach(el => el.classList.add('reveal'));

  const featuresGrid = document.querySelector('.features__grid');
  if (featuresGrid) featuresGrid.classList.add('reveal-stagger');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,     
    rootMargin: '0px 0px -40px 0px' 
  });

  elements.forEach(el => observer.observe(el));
}


function initGallery() {
  const track = document.getElementById('galleryTrack');
  const btnPrev = document.getElementById('galleryPrev');
  const btnNext = document.getElementById('galleryNext');

  if (!track) return;

  const SCROLL_AMOUNT = 350; 

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

  function updateArrows() {
    if (!btnPrev || !btnNext) return;

    btnPrev.style.opacity = track.scrollLeft <= 10 ? '0.35' : '1';
    btnPrev.style.pointerEvents = track.scrollLeft <= 10 ? 'none' : 'auto';

    const maxScroll = track.scrollWidth - track.clientWidth;
    btnNext.style.opacity = track.scrollLeft >= maxScroll - 10 ? '0.35' : '1';
    btnNext.style.pointerEvents = track.scrollLeft >= maxScroll - 10 ? 'none' : 'auto';
  }

  track.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows(); 

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
    const walk = (x - startX) * 1.5; 
    track.scrollLeft = scrollLeft - walk;

    if (Math.abs(walk) > 5) hasDragged = true;
  });

  track.querySelectorAll('a, .gallery__card').forEach(el => {
    el.addEventListener('click', (e) => {
      if (hasDragged) e.preventDefault();
    });
  });

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

  track.querySelectorAll('.gallery__card img').forEach(img => {
    const original = img.src;
    const hover = img.getAttribute('data-hover');
    if (!hover) return;

    img.addEventListener('mouseenter', () => img.src = hover);
    img.addEventListener('mouseleave', () => img.src = original);
  });
}

function loadPartials() {
  const depth = location.pathname.split('/').filter(Boolean).length;
  const base = depth > 1 ? '../'.repeat(depth - 1) : './';

  const navPlaceholder = document.getElementById('navbar-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  const loads = [];

  if (navPlaceholder) {
    loads.push(
      fetch(base + 'navbar.html')
        .then(r => r.text())
        .then(html => {
          navPlaceholder.outerHTML = html;
          initNavbar();
          initHamburger();
          initMegaMenu();
          initMobileAccordion();
        })
    );
  }

  if (footerPlaceholder) {
    loads.push(
      fetch(base + 'footer.html')
        .then(r => r.text())
        .then(html => { footerPlaceholder.outerHTML = html; })
    );
  }

  return Promise.all(loads);
}

document.addEventListener('DOMContentLoaded', () => {
  loadPartials().then(() => {
    initScrollReveal();
    initGallery();
  });
});