/*
 * Главная страница ayzenshtat.ru — поведение без React.
 * Повторяет анимации (GSAP + ScrollTrigger), меню, прокрутку к разделам,
 * отправку формы в send-max.php, окно «Заявка отправлена», баннер cookie
 * и цели Яндекс Метрики.
 */
(function () {
  'use strict';

  var METRIKA_ID = 110737676;
  var root = document.documentElement;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function ref(name) { return $('[data-ref="' + name + '"]'); }

  function ymGoal(name) {
    try { if (typeof window.ym === 'function') window.ym(METRIKA_ID, 'reachGoal', name); } catch (e) { /* ignore */ }
  }

  function scrollToId(hash) {
    var target = hash && hash.charAt(0) === '#' ? document.querySelector(hash) : null;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return !!target;
  }

  /* ---------- Меню ---------- */
  var nav = ref('Navbar-nav');
  var mobileMenu = $('#mobile-menu');
  var menuBtn = $('#mobile-menu-button');
  var SCROLLED = ['bg-[var(--color-bg)]/90', 'backdrop-blur-lg', 'border-b', 'border-[var(--color-border)]'];

  function onScrollNav() {
    if (!nav) return;
    var scrolled = window.scrollY > 100;
    SCROLLED.forEach(function (c) { nav.classList.toggle(c, scrolled); });
    nav.classList.toggle('bg-transparent', !scrolled);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  function setMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('opacity-100', open);
    mobileMenu.classList.toggle('visible', open);
    mobileMenu.classList.toggle('opacity-0', !open);
    mobileMenu.classList.toggle('invisible', !open);
    if (menuBtn) {
      menuBtn.querySelector('.icon-menu').style.display = open ? 'none' : '';
      menuBtn.querySelector('.icon-close').style.display = open ? '' : 'none';
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }
  if (menuBtn) menuBtn.addEventListener('click', function () {
    setMenu(!mobileMenu.classList.contains('visible'));
  });
  var backdrop = mobileMenu && mobileMenu.firstElementChild;
  if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });

  // Все внутренние ссылки-якоря: плавная прокрутка и закрытие мобильного меню
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href.length < 2) return;
    if (document.querySelector(href)) {
      e.preventDefault();
      setMenu(false);
      scrollToId(href);
    }
  });
  // Кнопки, ведущие к форме
  $$('[data-scroll-to]').forEach(function (btn) {
    btn.addEventListener('click', function () { scrollToId(btn.getAttribute('data-scroll-to')); });
  });

  /* ---------- Форма записи ---------- */
  var form = ref('Contact-form');
  var consent = $('#consent');
  var submitBtn = form && $('.submit-btn', form);
  var submitIdle = submitBtn ? submitBtn.innerHTML : '';
  var submitLoading = $('#tpl-loading') ? $('#tpl-loading').innerHTML : 'Отправка...';

  function syncSubmit(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = !!loading || !(consent && consent.checked);
    submitBtn.innerHTML = loading ? submitLoading : submitIdle;
  }
  if (consent) consent.addEventListener('change', function () { syncSubmit(false); });
  syncSubmit(false);

  var dialog = $('#success-dialog');
  function openDialog() {
    if (!dialog) return;
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    var close = $('[data-dialog-close]', dialog);
    if (close) close.focus();
  }
  function closeDialog() {
    if (!dialog) return;
    dialog.hidden = true;
    document.body.style.overflow = '';
  }
  if (dialog) {
    $$('[data-dialog-close]', dialog).forEach(function (el) { el.addEventListener('click', closeDialog); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dialog.hidden) closeDialog(); });
  }

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!consent || !consent.checked) {
      alert('Пожалуйста, подтвердите согласие на обработку персональных данных.');
      return;
    }
    var data = {
      name: form.elements.name.value,
      phone: form.elements.phone.value,
      email: form.elements.email.value,
      company: form.elements.company.value
    };
    syncSubmit(true);
    fetch('/send-max.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; })
      .then(function (result) {
        if (result && result.ok) {
          ymGoal('lead_form_sent');
          form.reset();
          syncSubmit(false);
          openDialog();
        } else {
          syncSubmit(false);
          alert('Не удалось отправить заявку. Попробуйте позже или свяжитесь напрямую.');
        }
      })
      .catch(function () {
        syncSubmit(false);
        alert('Произошла ошибка. Попробуйте ещё раз.');
      });
  });

  /* ---------- Цели на контакты ---------- */
  $$('[data-goal]').forEach(function (a) {
    a.addEventListener('click', function () { ymGoal(a.getAttribute('data-goal')); });
  });

  /* ---------- Баннер cookie ---------- */
  var cookie = $('#cookie-banner');
  if (cookie) {
    var accepted = null;
    try { accepted = localStorage.getItem('cookie_consent'); } catch (e) { /* ignore */ }
    if (!accepted) cookie.hidden = false;
    var acceptBtn = $('button', cookie);
    if (acceptBtn) acceptBtn.addEventListener('click', function () {
      try { localStorage.setItem('cookie_consent', 'true'); } catch (e) { /* ignore */ }
      cookie.hidden = true;
    });
  }

  /* ---------- Анимации ---------- */
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) {
    // Библиотека не загрузилась — показываем всё без анимаций
    root.classList.remove('js');
    root.classList.add('no-js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Скорость всех анимаций: 1 — как в React-версии, 0.7 — примерно в полтора раза медленнее
  var ANIMATION_SPEED = 1;
  gsap.globalTimeline.timeScale(ANIMATION_SPEED);

  // Анимации запускаются, когда загрузятся шрифты (не дольше 1 секунды ожидания).
  // В React-версии они стартовали после загрузки большого скрипта, и к этому моменту
  // шрифты обычно уже были на месте: без ожидания заголовки перескакивают со
  // стандартного шрифта на фирменный прямо во время анимации, а точки срабатывания
  // при прокрутке считаются по неверной высоте блоков.
  function whenFontsReady(cb) {
    var done = false;
    function go() { if (!done) { done = true; cb(); } }
    try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); } catch (e) { /* ignore */ }
    setTimeout(go, 1000);
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  whenFontsReady(function () {
    // Анимации появления проигрываются один раз за просмотр страницы:
    // при прокрутке назад и повторном проходе блоки остаются на месте.
    ScrollTrigger.defaults({ toggleActions: 'play none none none', start: 'top 80%', once: true });

    function st(trigger, start) {
      return { trigger: trigger, start: start, toggleActions: 'play none none none', once: true };
    }

    // Меню
    if (nav) gsap.fromTo(nav, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 1.5 });

    // Первый экран
    (function () {
      var sec = ref('Hero-section'); if (!sec) return;
      var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo($$('.grid-dot', sec), { opacity: 0, scale: 0 },
        { opacity: 0.15, scale: 1, duration: 1.2, stagger: { amount: 0.8, from: 'center' } });
      tl.fromTo(ref('Hero-preTitle'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.6');
      tl.fromTo($$('.word', ref('Hero-title')), { y: 100, opacity: 0, rotateX: -40 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.08 }, '-=0.3');
      tl.fromTo(ref('Hero-subtitle'), { opacity: 0, filter: 'blur(10px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.7 }, '-=0.4');
      tl.fromTo(ref('Hero-cta'), { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }, '-=0.3');
      tl.fromTo($$('.metric-item', ref('Hero-metrics')), { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.2');
      gsap.to($$('.floating-shape', sec), {
        y: 'random(-30, 30)', x: 'random(-20, 20)', rotation: 'random(-10, 10)',
        duration: 'random(8, 15)', ease: 'sine.inOut', repeat: -1, yoyo: true,
        stagger: { amount: 5, from: 'random' }
      });
    })();

    // Проблемы
    (function () {
      var sec = ref('Problems-section'); if (!sec) return;
      gsap.fromTo(ref('Problems-title'), { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out', scrollTrigger: st(sec, 'top 80%') });
      gsap.fromTo(ref('Problems-intro'), { opacity: 0, filter: 'blur(5px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', scrollTrigger: st(sec, 'top 70%') });
      $$('.problem-card', ref('Problems-cards')).forEach(function (card, i) {
        gsap.fromTo(card, { x: 100, y: 50, rotateZ: 5, opacity: 0 },
          { x: 0, y: 0, rotateZ: 0, opacity: 1, duration: 0.6, ease: 'expo.out', scrollTrigger: st(card, 'top 85%'), delay: i * 0.12 });
      });
    })();

    // Обо мне
    (function () {
      var sec = ref('About-section'); if (!sec) return;
      var img = ref('About-image'), frame = ref('About-frame'), content = ref('About-content');
      gsap.fromTo(img, { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'expo.out', scrollTrigger: st(sec, 'top 70%') });
      gsap.fromTo(frame, { opacity: 0, x: 20, y: 20 },
        { opacity: 1, x: 0, y: 0, duration: 1, ease: 'power2.out', scrollTrigger: st(sec, 'top 60%'), delay: 0.3 });
      gsap.fromTo(ref('About-title'), { x: 80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out', scrollTrigger: st(sec, 'top 65%'), delay: 0.2 });
      gsap.fromTo($$('.bio-paragraph', content), { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.15, scrollTrigger: st(sec, 'top 55%'), delay: 0.4 });
      $$('.metric-card', content).forEach(function (item, i) {
        gsap.fromTo(item, { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', scrollTrigger: st(item, 'top 90%'), delay: i * 0.1 });
      });
      gsap.to(img, { y: -40, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to(frame, { y: 20, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    })();

    // Услуги
    (function () {
      var sec = ref('Services-section'); if (!sec) return;
      gsap.fromTo(ref('Services-title'), { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', scrollTrigger: st(sec, 'top 80%') });
      $$('.service-card', sec).forEach(function (card, i) {
        gsap.fromTo(card, { rotateY: -30, opacity: 0, x: 100 },
          { rotateY: 0, opacity: 1, x: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: st(card, 'top 85%'), delay: i * 0.15 });
      });
    })();

    // Результаты
    (function () {
      var sec = ref('Results-section'); if (!sec) return;
      gsap.fromTo(ref('Results-title'), { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', scrollTrigger: st(sec, 'top 80%') });
      $$('.result-card', ref('Results-cards')).forEach(function (card, i) {
        gsap.fromTo(card, { y: 80, rotateX: 15, opacity: 0 },
          { y: 0, rotateX: 0, opacity: 1, duration: 0.7, ease: 'expo.out', scrollTrigger: st(card, 'top 90%'), delay: i * 0.13 });
      });
      gsap.to(sec, { backgroundColor: '#242b3d', ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    })();

    // Кому подходит
    (function () {
      var sec = ref('ForWhom-section'); if (!sec) return;
      var center = ref('ForWhom-center');
      gsap.fromTo(center, { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)', scrollTrigger: st(sec, 'top 70%'),
          // Лёгкая пульсация 1 → 1.02 начинается, когда круг уже появился.
          // В React-версии она стартовала сразу при загрузке от масштаба 0,
          // и круг каждые 4 секунды сжимался в точку.
          onComplete: function () { gsap.to(center, { scale: 1.02, duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true }); } });
      $$('.connecting-line', ref('ForWhom-lines')).forEach(function (line, i) {
        gsap.fromTo(line, { strokeDashoffset: 200 },
          { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: st(sec, 'top 60%'), delay: 0.4 + i * 0.12 });
      });
      var dirs = [{ x: -50, y: -50 }, { x: 50, y: -50 }, { x: -50, y: 50 }, { x: 50, y: 50 }];
      $$('.criterion-card', ref('ForWhom-criteria')).forEach(function (card, i) {
        var d = dirs[i] || { x: 0, y: 0 };
        gsap.fromTo(card, { x: d.x, y: d.y, opacity: 0 },
          { x: 0, y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', scrollTrigger: st(sec, 'top 55%'), delay: 0.6 + i * 0.12 });
      });

      // Мобильная раскладка: в React-версии эти карточки не анимировались и оставались невидимыми
      var desktop = ref('ForWhom-criteria');
      $$('.criterion-card', sec).filter(function (c) { return !desktop || !desktop.contains(c); }).forEach(function (card, i) {
        gsap.fromTo(card, { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', scrollTrigger: st(card, 'top 90%'), delay: i * 0.08 });
      });
    })();

    // Контакты
    (function () {
      var sec = ref('Contact-section'); if (!sec) return;
      gsap.fromTo(ref('Contact-title'), { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', scrollTrigger: st(sec, 'top 80%') });
      gsap.fromTo(ref('Contact-divider'), { scaleY: 0 },
        { scaleY: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: st(sec, 'top 70%'), delay: 0.3 });
      gsap.fromTo($$('.form-field', form), { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.1, scrollTrigger: st(sec, 'top 65%'), delay: 0.4 });
      if (submitBtn) gsap.fromTo(submitBtn, { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)', scrollTrigger: st(sec, 'top 60%'), delay: 0.9 });
      gsap.fromTo(ref('Contact-contacts'), { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out', scrollTrigger: st(sec, 'top 65%'), delay: 0.5 });
    })();

    // Подвал
    (function () {
      var f = ref('Footer-footer'); if (!f) return;
      gsap.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: st(f, 'top 95%') });
    })();

    ScrollTrigger.refresh();

    // Переход по ссылке с якорем (например, /#contact из рекламы или из статьи)
    if (window.location.hash) {
      setTimeout(function () { requestAnimationFrame(function () { scrollToId(window.location.hash); }); }, 500);
    }
  });
})();
