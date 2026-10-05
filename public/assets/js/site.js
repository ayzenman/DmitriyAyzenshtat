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
  var errorBox = $('#form-error');
  var nameInput = $('#name-input');
  var contactInput = $('#contact-input');

  // «Один раз за визит»: флаг живёт до закрытия вкладки
  function onceGoal(name) {
    try { if (sessionStorage.getItem('goal_' + name)) return; sessionStorage.setItem('goal_' + name, '1'); } catch (e) { /* ignore */ }
    ymGoal(name);
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = !!loading;
    submitBtn.innerHTML = loading ? submitLoading : submitIdle;
  }

  function clearError() {
    if (errorBox) { errorBox.hidden = true; errorBox.textContent = ''; }
    $$('.field-invalid', form).forEach(function (el) { el.classList.remove('field-invalid'); });
  }
  function showError(text, field) {
    clearError();
    if (errorBox) { errorBox.textContent = text; errorBox.hidden = false; }
    if (field) { field.classList.add('field-invalid'); try { field.focus(); } catch (e) { /* ignore */ } }
  }

  if (form) {
    // Ошибка исчезает, как только человек начинает исправлять
    form.addEventListener('input', clearError);
    if (consent) consent.addEventListener('change', clearError);
    // Начало заполнения
    form.addEventListener('focusin', function (e) {
      if (e.target.matches && e.target.matches('input, textarea')) onceGoal('form_start');
    });
  }

  // Посетитель долистал до блока с формой
  var contactSection = $('#contact');
  if (contactSection && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { onceGoal('contact_block_view'); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(contactSection);
  }

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
    var name = nameInput ? nameInput.value.trim() : '';
    var contact = contactInput ? contactInput.value.trim() : '';
    if (!name) { showError('Укажите, как к вам обращаться.', nameInput); return; }
    if (!contact) { showError('Укажите телефон.', contactInput); return; }
    if (contact.replace(/\D/g, '').length < 10) {
      showError('Проверьте номер телефона.', contactInput); return;
    }
    if (!consent || !consent.checked) {
      ymGoal('form_no_consent');
      showError('Для отправки нужно согласие на обработку персональных данных.', consent); return;
    }
    clearError();
    var data = { name: name, method: 'phone', contact: contact };
    setLoading(true);
    fetch('/send-max.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; })
      .then(function (result) {
        setLoading(false);
        if (result && result.ok) {
          ymGoal('lead_form_sent');
          form.reset();
          clearError();
          openDialog();
        } else {
          ymGoal('form_error');
          showError('Не удалось отправить заявку. Попробуйте позже или свяжитесь напрямую по контактам рядом с формой.');
        }
      })
      .catch(function () {
        setLoading(false);
        ymGoal('form_error');
        showError('Произошла ошибка. Попробуйте ещё раз или свяжитесь напрямую по контактам рядом с формой.');
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

  /* ---------- «Подходит не всем»: линии от круга к углам карточек ---------- */
  function layoutForWhomLines() {
    var svg = ref('ForWhom-lines'), crit = ref('ForWhom-criteria'), cen = ref('ForWhom-center');
    if (!svg || !crit || !cen || !cen.firstElementChild) return;
    var sr = svg.getBoundingClientRect();
    if (!sr.width) return; // на телефоне схема скрыта
    var circ = cen.firstElementChild.getBoundingClientRect();
    var cx = circ.left + circ.width / 2 - sr.left, cy = circ.top + circ.height / 2 - sr.top, r = circ.width / 2;
    var cards = $$('.criterion-card', crit), lines = $$('.connecting-line', svg);
    // Ближний к кругу угол каждой карточки: верх-лево, верх-право, низ-лево, низ-право
    var corners = [['right', 'bottom'], ['left', 'bottom'], ['right', 'top'], ['left', 'top']];
    lines.forEach(function (l, i) {
      var c = cards[i]; if (!c || !corners[i]) return;
      var cr = c.getBoundingClientRect();
      var x = cr[corners[i][0]] - sr.left, y = cr[corners[i][1]] - sr.top;
      var dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
      l.setAttribute('x1', (cx + dx / d * r).toFixed(1));
      l.setAttribute('y1', (cy + dy / d * r).toFixed(1));
      l.setAttribute('x2', x.toFixed(1));
      l.setAttribute('y2', y.toFixed(1));
      l.setAttribute('stroke', 'rgba(212,168,83,0.45)');
      l.setAttribute('stroke-dasharray', 'none');
    });
  }
  layoutForWhomLines();
  window.addEventListener('load', layoutForWhomLines);
  window.addEventListener('resize', layoutForWhomLines);
  try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutForWhomLines); } catch (e) { /* ignore */ }

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
    // «Один раз» задаётся только у анимаций появления (в функции st ниже).
    // Параллакс фото и смена фона раздела «Результаты» работают постоянно, как в React-версии.
    ScrollTrigger.defaults({ toggleActions: 'play none none none', start: 'top 80%' });

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

    // Ниже первого экрана анимаций нет: блоки видны сразу.
    (function () {
      var hero = ref('Hero-section');
      $$('[data-anim]').forEach(function (el) {
        if (el === nav || (hero && hero.contains(el))) return;
        el.classList.remove('opacity-0'); el.style.opacity = '1';
      });
    })();

    ScrollTrigger.refresh();

    // Переход по ссылке с якорем (например, /#contact из рекламы или из статьи)
    if (window.location.hash) {
      setTimeout(function () { requestAnimationFrame(function () { scrollToId(window.location.hash); }); }, 500);
    }
  });
})();
