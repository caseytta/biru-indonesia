function initMegaMenu() {
  const item    = document.getElementById('produkMenu');
  if (!item) return;

  const trigger = item.querySelector('.navbar__produk-trigger');
  const mega    = item.querySelector('.mega');
  const cats    = item.querySelectorAll('.mega__cat');
  const panels  = item.querySelectorAll('.mega__panel');

  let hoverTimer = null;

  function open()  { item.classList.add('is-open'); trigger.setAttribute('aria-expanded','true'); }
  function close() { item.classList.remove('is-open'); trigger.setAttribute('aria-expanded','false'); }

  item.addEventListener('mouseenter', () => { clearTimeout(hoverTimer); open(); });
  item.addEventListener('mouseleave', () => { hoverTimer = setTimeout(close, 150); });

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    item.classList.contains('is-open') ? close() : open();
  });

  function activateCat(cat) {
    cats.forEach(c => c.classList.toggle('is-active', c.dataset.cat === cat));
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.cat === cat));
  }
  cats.forEach(cat => {
    cat.addEventListener('mouseenter', () => activateCat(cat.dataset.cat));
  });

  document.addEventListener('click', (e) => {
    if (!item.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function initMobileAccordion() {
  document.querySelectorAll('.m-acc__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const acc = btn.closest('.m-acc');
      const open = acc.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
    });
  });
 
  document.querySelectorAll('.m-cat__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.closest('.m-cat');
      const open = cat.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
    });
  });
}

