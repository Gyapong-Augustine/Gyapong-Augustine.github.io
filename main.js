/* =============================================
   TENZIN — Research Portfolio JavaScript
   Smooth interactions & performance features
   ============================================= */

'use strict';

/* ─── 1. NAVBAR: shrink + hide on scroll ─── */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // Shrink navbar after scrolling 60px
        navbar.classList.toggle('scrolled', currentY > 60);

        // Hide navbar when scrolling down, show when scrolling up
        if (currentY > lastY && currentY > 120) {
          navbar.classList.add('nav-hidden');
        } else {
          navbar.classList.remove('nav-hidden');
        }

        lastY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ─── 2. ACTIVE NAV LINK on scroll ─── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.menu a');
  if (!navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => observer.observe(sec));
})();


/* ─── 3. SMOOTH SCROLL for anchor links ─── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ─── 4. SCROLL REVEAL ANIMATIONS ─── */
(function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.card, .stat-box, .timeline ul li, .about-text, .section h2, .section-desc'
  );

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay based on element index within its parent
        const siblings = Array.from(entry.target.parentElement.children);
        const index = siblings.indexOf(entry.target);
        const delay = index * 80;

        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => {
    el.classList.add('reveal-ready');
    observer.observe(el);
  });
})();


/* ─── 5. LIVE SEARCH (filters research cards) ─── */
(function initSearch() {
  const searchInput = document.querySelector('.search input');
  const searchBtn   = document.querySelector('.search button');
  if (!searchInput) return;

  function runSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const cards  = document.querySelectorAll('.card');
    const timelineItems = document.querySelectorAll('.timeline ul li');

    let matchCount = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const match = !query || text.includes(query);
      card.style.display = match ? '' : 'none';
      if (match && query) {
        card.classList.add('search-highlight');
        matchCount++;
      } else {
        card.classList.remove('search-highlight');
      }
    });

    timelineItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const match = !query || text.includes(query);
      item.style.opacity = match ? '1' : '0.25';
    });

    // Show/clear no-results message
    let noResult = document.getElementById('no-results-msg');
    if (query && matchCount === 0) {
      if (!noResult) {
        noResult = document.createElement('p');
        noResult.id = 'no-results-msg';
        noResult.style.cssText = 'color: var(--text-muted); font-size: 0.9rem; margin-top: 1.5rem; text-align: center; grid-column: 1/-1;';
        noResult.textContent = `No results for "${query}" — try a different keyword.`;
        document.querySelector('.grid')?.appendChild(noResult);
      }
    } else if (noResult) {
      noResult.remove();
    }
  }

  // Search on typing (debounced)
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 220);
  });

  // Search on Enter key
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { clearTimeout(debounceTimer); runSearch(); }
    if (e.key === 'Escape') {
      searchInput.value = '';
      runSearch();
      searchInput.blur();
    }
  });

  // Search on button click
  searchBtn?.addEventListener('click', () => { clearTimeout(debounceTimer); runSearch(); });
})();


/* ─── 6. STATS COUNTER ANIMATION ─── */
(function initCounters() {
  const statBoxes = document.querySelectorAll('.stat-box strong');
  if (!statBoxes.length) return;

  function animateCount(el, target, suffix) {
    let start = 0;
    const duration = 1200;
    const stepTime = 16;
    const steps = Math.ceil(duration / stepTime);
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, stepTime);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.textContent.trim();          // e.g. "5+"
        const suffix = raw.replace(/[0-9]/g, '');   // "+"
        const num = parseInt(raw, 10);              // 5
        if (!isNaN(num)) animateCount(el, num, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.6 });

  statBoxes.forEach(el => observer.observe(el));
})();


/* ─── 7. MOBILE MENU TOGGLE ─── */
(function initMobileMenu() {
  const navbar = document.querySelector('.navbar');
  const menu   = document.querySelector('.menu');
  if (!navbar || !menu) return;

  // Inject hamburger button
  const burger = document.createElement('button');
  burger.className = 'burger-btn';
  burger.setAttribute('aria-label', 'Toggle navigation');
  burger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  navbar.appendChild(burger);

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('menu-open');
    burger.classList.toggle('burger-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('menu-open');
      burger.classList.remove('burger-open');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      menu.classList.remove('menu-open');
      burger.classList.remove('burger-open');
    }
  });
})();


/* ─── 8. CARD TILT EFFECT (subtle 3D hover) ─── */
(function initCardTilt() {
  const cards = document.querySelectorAll('.card');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -5;
      const rotY = ((x - cx) / cx) *  5;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ─── 9. READING PROGRESS BAR ─── */
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; width: 0%;
    background: linear-gradient(90deg, var(--accent), var(--accent-light));
    z-index: 9999; transition: width 0.1s linear; pointer-events: none;
  `;
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop  = document.documentElement.scrollTop;
    const scrollMax  = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollMax > 0 ? (scrollTop / scrollMax) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();


/* ─── 10. COPY EMAIL / CONTACT on click ─── */
(function initContactCopy() {
  document.querySelectorAll('[data-email]').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = 'Click to copy email';

    el.addEventListener('click', () => {
      const email = el.getAttribute('data-email');
      navigator.clipboard.writeText(email).then(() => {
        const original = el.textContent;
        el.textContent = '✓ Copied!';
        setTimeout(() => { el.textContent = original; }, 1800);
      });
    });
  });
})();


/* ─── 11. BACK TO TOP BUTTON ─── */
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '↑';
  btn.style.cssText = `
    position: fixed; bottom: 2rem; right: 2rem;
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--primary); color: #fff;
    font-size: 1.2rem; font-weight: 600; line-height: 1;
    border: none; cursor: pointer; z-index: 500;
    box-shadow: 0 4px 16px rgba(11,37,69,0.25);
    opacity: 0; transform: translateY(12px);
    transition: opacity 0.3s, transform 0.3s, background 0.2s;
    display: flex; align-items: center; justify-content: center;
  `;
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btn.style.opacity = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(12px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--accent)'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = 'var(--primary)'; });
})();


/* ─── 12. INJECT CSS for JS-driven features ─── */
(function injectDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `

    /* Navbar scroll state */
    .navbar { transition: padding 0.3s, box-shadow 0.3s, transform 0.35s; }
    .navbar.scrolled { padding-top: 0.6rem; padding-bottom: 0.6rem; box-shadow: 0 2px 20px rgba(11,37,69,0.10); }
    .navbar.nav-hidden { transform: translateY(-100%); }

    /* Active nav link */
    .menu a.active { color: var(--accent) !important; }
    .menu a.active::after { width: 100% !important; }

    /* Scroll reveal */
    .reveal-ready {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .reveal-ready.revealed {
      opacity: 1;
      transform: translateY(0);
    }

    /* Search highlight */
    .card.search-highlight {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px rgba(26,140,125,0.15) !important;
    }

    /* Burger button */
    .burger-btn {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      margin-left: 1rem;
    }
    .burger-btn span {
      display: block;
      width: 24px;
      height: 2px;
      background: var(--primary);
      border-radius: 2px;
      transition: transform 0.3s, opacity 0.3s;
    }
    .burger-btn.burger-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .burger-btn.burger-open span:nth-child(2) { opacity: 0; }
    .burger-btn.burger-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    @media (max-width: 768px) {
      .burger-btn { display: flex; }

      .menu {
        position: absolute;
        top: 100%;
        left: 0; right: 0;
        background: rgba(255,255,255,0.97);
        backdrop-filter: blur(12px);
        border-top: 1px solid var(--border);
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.35s ease, padding 0.3s ease;
      }
      .menu.menu-open {
        max-height: 300px;
        padding: 1rem 0;
      }
      .menu ul {
        flex-direction: column;
        gap: 0;
        padding: 0 5%;
      }
      .menu ul li a {
        display: block;
        padding: 0.75rem 0;
        font-size: 1rem;
        border-bottom: 1px solid var(--border);
      }
    }
  `;
  document.head.appendChild(style);
})();


/* ─── 13. PAGE LOAD: fade in body ─── */
(function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.45s ease';

  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });

  // Fallback if load fires late
  setTimeout(() => { document.body.style.opacity = '1'; }, 800);
})();