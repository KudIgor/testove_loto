document.addEventListener('DOMContentLoaded', () => {
  try {
    /* ===================== Дані концертів ===================== */
    const concerts = [
      { city: 'Київ', venue: 'Docker-G Pub', seats: 250, datetime: '2025-10-25T19:00', price: 450 },
      { city: 'Львів', venue: 'IFESTrepublic', seats: 400, datetime: '2025-11-01T20:00', price: 520 },
      { city: 'Одеса', venue: 'Зелений театр', seats: 700, datetime: '2025-11-09T19:30', price: 420 },
      { city: 'Харків', venue: 'ArtZavod', seats: 500, datetime: '2025-11-16T19:00', price: 480 }
    ];

    /* ===================== Утиліти ===================== */
    function formatDateTime(iso) {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return { dateStr: iso, timeStr: '' };
      const dateStr = d.toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
      return { dateStr, timeStr };
    }

    /* ===================== СЕЛЕКТОРИ (гнучкі) ===================== */
    const tbodyTable = document.getElementById('concert-list-table') || document.getElementById('concert-list');
    const cardsWrap = document.getElementById('concert-cards');

    /* ===================== РЕНДЕР ===================== */
    function renderConcerts() {
      if (tbodyTable) tbodyTable.innerHTML = '';
      if (cardsWrap) cardsWrap.innerHTML = '';

      concerts.forEach((c, idx) => {
        const { dateStr, timeStr } = formatDateTime(c.datetime);

        if (tbodyTable) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>
              <div class="city-name">${c.city}</div>
              <div class="venue">${c.venue}</div>
            </td>
            <td>
              <div class="chips"><span class="badge">${c.seats} місць</span></div>
            </td>
            <td>
              <div class="date-line">${dateStr}</div>
              <div class="date-sub">${timeStr}</div>
            </td>
            <td><span class="badge price-chip">${c.price} грн</span></td>
            <td><button class="btn-ticket" data-idx="${idx}" aria-label="Замовити квиток на ${c.city}">Замовити</button></td>
          `;
          tbodyTable.appendChild(tr);
        }

        if (cardsWrap) {
          const card = document.createElement('div');
          card.className = 'concert-card';
          card.innerHTML = `
            <div class="left">
              <div class="city-name">${c.city}</div>
              <div class="venue small">${c.venue}</div>
              <div class="small muted" style="margin-top:6px">${dateStr}, ${timeStr}</div>
            </div>
            <div class="right">
              <div style="text-align:right">
                <div class="badge price-chip">${c.price} грн</div>
                <div class="muted small" style="margin-top:6px">${c.seats} місць</div>
              </div>
              <div>
                <button class="btn-ticket" data-idx="${idx}" aria-label="Купити квиток на ${c.city}">Купити</button>
              </div>
            </div>
          `;
          cardsWrap.appendChild(card);
        }
      });

      console.log('Rendered concerts:', concerts.length);
    }

    renderConcerts();

    /* ===================== МОДАЛ БРОНЮВАННЯ ===================== */
    const modal = document.getElementById('modal');
    const concertInfo = document.getElementById('concertInfo');
    const bookingForm = document.getElementById('booking-form');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');

    let selectedConcertIndex = null;

    function openBookingModal(index) {
      selectedConcertIndex = Number(index);
      const c = concerts[selectedConcertIndex];
      if (!c) {
        console.error('Invalid concert index for modal:', index);
        return;
      }
      const fd = formatDateTime(c.datetime);
      if (concertInfo) concertInfo.textContent = `${c.city} — ${c.venue} • ${fd.dateStr}, ${fd.timeStr}`;
      if (modal) {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        const first = document.querySelector('#booking-form input');
        if (first) first.focus();
      }
    }

    function closeBookingModal() {
      if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-ticket');
      if (btn) {
        e.preventDefault();
        const idx = btn.dataset.idx;
        if (typeof idx === 'undefined') {
          console.warn('btn-ticket without data-idx');
          return;
        }
        openBookingModal(idx);
      }
    });

    if (modalClose) modalClose.addEventListener('click', closeBookingModal);
    if (modalCancel) modalCancel.addEventListener('click', closeBookingModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBookingModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('show')) closeBookingModal();
    });

    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(bookingForm);
        const buyer = (fd.get('buyer') || '').toString().trim();
        const phone = (fd.get('phone') || '').toString().trim();
        const tickets = fd.get('tickets') || '1';
        if (!buyer || !phone) {
          alert('Будь ласка, заповніть імʼя та телефон.');
          return;
        }
        const concert = concerts[selectedConcertIndex];
const resultBox = document.getElementById('formResult');

resultBox.textContent = `Дякуємо, ${buyer}! Замовлення на ${tickets} квитків прийняте.`;
resultBox.classList.remove('visually-hidden');
resultBox.classList.remove('error');
resultBox.classList.add('success');
setTimeout(() => {
  bookingForm.reset();
  closeBookingModal();
  resultBox.classList.add('visually-hidden');
}, 2000);
        bookingForm.reset();
        closeBookingModal();
      });
    } else {
      console.warn('Не знайдено форму #booking-form');
    }

    /* ===================== SMOOTH SCROLL (header offset + easing) ===================== */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getHeaderHeight() {
      const header = document.querySelector('header');
      return header ? header.offsetHeight : 0;
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animatedScrollTo(targetY, duration = 700) {
      if (reduceMotion) {
        window.scrollTo(0, targetY);
        return;
      }
      const startY = window.scrollY || window.pageYOffset;
      const distance = targetY - startY;
      const startTime = performance.now();

      function frame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, Math.round(startY + distance * eased));
        if (elapsed < duration) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function scrollToId(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const headerOffset = getHeaderHeight();
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - headerOffset - 12;
      animatedScrollTo(targetY);
    }

    document.addEventListener('click', function (e) {
      const el = e.target.closest('.scroll-to') || (e.target.matches('a[href^="#"]') ? e.target : null);
      if (!el) return;
      const target = el.dataset?.target || (el.getAttribute ? el.getAttribute('href')?.replace('#', '') : null);
      if (!target) return;
      e.preventDefault();
      scrollToId(target);
    });

    window.addEventListener('load', function () {
      if (location.hash) {
        const id = location.hash.replace('#', '');
        setTimeout(() => scrollToId(id), 80);
      }
    });


    /* ===================== CONTACT FORM ===================== */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(contactForm);
        const name = (f.get('name') || '').toString().trim();
        const email = (f.get('email') || '').toString().trim();
        if (!name || !email) {
          alert('Будь ласка, заповніть ім\'я та email.');
          return;
        }
const result = document.getElementById('formResult');

result.textContent = "Дякую! Повідомлення відправлено.";
result.classList.remove('visually-hidden');
result.classList.add('success');

contactForm.reset();

setTimeout(() => {
  result.classList.add('visually-hidden');
}, 3000);
        contactForm.reset();
      });
    }

    console.log('Main script initialized: concerts, modal, smooth-scroll, mobile-nav, contact-form.');
  } catch (err) {
    console.error('Помилка в основному script.js:', err);
  }
});
