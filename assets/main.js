// Inject shared header and footer, then wire interactions
(async function initSite() {
  const inject = async (selector, url) => {
    const host = document.querySelector(selector);
    if (!host) return;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const html = await res.text();
      host.innerHTML = html;
    } catch (e) {
      console.error('Failed to inject', url, e);
    }
  };

  await inject('#site-header', 'partials/header.html');
  await inject('#site-footer', 'partials/footer.html');

  // After header/footer are injected, initialize interactions
  initNavActive();
  initMobileMenu();
  initBooking();
  initPageActions();
})();

function initNavActive() {
  const path = location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html': 'home',
    'barber1.html': 'services',
    'barbaer2.html': 'gallery',
    'barbaer3.html': 'contact'
  };
  const currentKey = map[path] || null;
  document.querySelectorAll('.nav-link').forEach(a => {
    const isActive = a.dataset.link === currentKey;
    if (isActive) {
      a.classList.add('font-bold');
      a.setAttribute('aria-current', 'page');
    } else {
      a.classList.remove('font-bold');
      a.removeAttribute('aria-current');
    }
  });
}

// Global navbar uses black text on white background across all pages.

function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const overlayClose = drawer?.querySelector('[data-close-mobile]');
  const open = () => drawer && (drawer.classList.remove('hidden'));
  const close = () => drawer && (drawer.classList.add('hidden'));
  toggle?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlayClose?.addEventListener('click', close);
}

function initBooking() {
  const modal = document.getElementById('booking-modal');
  const form = document.getElementById('booking-form');
  const closeBtn = document.getElementById('booking-close');
  const overlayClose = modal?.querySelector('[data-close-booking]');
  const success = document.getElementById('booking-success');

  const open = () => modal && modal.classList.remove('hidden');
  const close = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    success?.classList.add('hidden');
    form?.reset();
  };

  document.querySelectorAll('[data-action="book"], .book-now').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      open();
    });
  });
  closeBtn?.addEventListener('click', close);
  overlayClose?.addEventListener('click', close);

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.phone || !data.service || !data.date) {
      alert('Please fill all required fields.');
      return;
    }
    try {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push({ ...data, createdAt: new Date().toISOString() });
      localStorage.setItem('bookings', JSON.stringify(bookings));
    } catch (err) {
      console.warn('LocalStorage unavailable', err);
    }
    success?.classList.remove('hidden');
    setTimeout(() => close(), 1200);
  });
}

function initPageActions() {
  // Hero buttons: Book Appointment, View Prices
  document.querySelectorAll('button').forEach(btn => {
    const text = btn.textContent?.trim().toLowerCase();
    if (!text) return;
    if (text.includes('view prices')) {
      btn.addEventListener('click', () => location.href = 'barber1.html');
    }
    if (text.includes('book appointment') || text.includes('book premium')) {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const bookTrigger = document.querySelector('[data-action="book"]');
        bookTrigger?.dispatchEvent(new Event('click'));
      });
    }
    if (text.includes('load more styles')) {
      btn.addEventListener('click', () => {
        alert('More styles coming soon. This is a prototype.');
      });
    }
  });

  // Directions button on Contact page
  document.querySelectorAll('a').forEach(a => {
    const text = a.textContent?.trim().toLowerCase();
    if (text && text.includes('get directions')) {
      a.addEventListener('click', e => {
        e.preventDefault();
        const address = '123 Urban Ave, Downtown District';
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
      });
    }
  });
}