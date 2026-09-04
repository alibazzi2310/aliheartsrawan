/* ═══════════════════════════════════════════
   For Rawan — shared behaviour
   Every piece below no-ops gracefully if the
   element it needs isn't on the page, so the
   box and the letters can share one file.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* A letter can ask for a different ambience with data-ambient on <body>.
     Default is hearts; the flower letters use petals. */
  var ambient = document.body.getAttribute('data-ambient') || 'hearts';

  var PETAL_PATH = 'M12 1 C 18 7, 18 17, 12 23 C 6 17, 6 7, 12 1';
  var PETAL_TINTS = ['#f0b9d4', '#e3c8f0', '#f7d4e6', '#d9c2ee', '#f4c6dd'];

  function petalSVG(size, tint, opacity) {
    return '<svg class="petal-spin" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" ' +
           'viewBox="0 0 24 24" style="animation-duration:' + (7 + Math.random() * 9).toFixed(1) + 's">' +
           '<path d="' + PETAL_PATH + '" fill="' + tint + '" fill-opacity="' + opacity + '"/></svg>';
  }

  /* ── a greeting that knows the time of day ── */
  (function timeGreeting() {
    var el = document.querySelector('[data-greeting]');
    if (!el) return;
    var name = el.getAttribute('data-greeting') || 'you';
    var h = new Date().getHours();
    var word;
    if (h >= 5 && h < 12)       word = 'Good morning';
    else if (h >= 12 && h < 17) word = 'Good afternoon';
    else if (h >= 17 && h < 22) word = 'Good evening';
    else                        word = 'Goodnight';
    el.textContent = word + ', ' + name;
  })();

  /* ── ambience: hearts drifting up, or petals falling ── */
  (function floaties() {
    var container = document.querySelector('.floaties');
    if (!container || reducedMotion) return;
    var small = window.innerWidth < 640;        // gentler on a phone screen

    if (ambient === 'petals') {
      var petalCount = small ? 12 : 20;
      for (var p = 0; p < petalCount; p++) {
        var fall = document.createElement('div');
        fall.className = 'petal-fall';
        fall.style.left = (Math.random() * 100).toFixed(2) + 'vw';
        fall.style.animationDuration = (13 + Math.random() * 13).toFixed(1) + 's';
        fall.style.animationDelay = (-Math.random() * 26).toFixed(1) + 's';
        var sway = document.createElement('div');
        sway.className = 'petal-sway';
        sway.style.animationDuration = (2.6 + Math.random() * 2.4).toFixed(1) + 's';
        sway.innerHTML = petalSVG(
          (small ? 11 : 13) + Math.random() * (small ? 8 : 12),
          PETAL_TINTS[p % PETAL_TINTS.length],
          (0.4 + Math.random() * 0.35).toFixed(2)
        );
        fall.appendChild(sway);
        container.appendChild(fall);
      }
      return;
    }

    var symbols = ['💜', '💗', '🩷', '✨', '🌸', '💕'];
    var count = small ? 10 : 18;
    var base = small ? 0.5 : 0.7;
    var range = small ? 0.5 : 1.1;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('span');
      el.className = 'floaty';
      el.textContent = symbols[i % symbols.length];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = (base + Math.random() * range) + 'rem';
      el.style.animationDuration = (14 + Math.random() * 14) + 's';
      el.style.animationDelay = (-Math.random() * 28) + 's';
      container.appendChild(el);
    }
  })();

  /* ── a trail of hearts under her finger ───── */
  (function heartTrail() {
    if (reducedMotion) return;
    var colors = ['#d476ab', '#cdb4e8', '#9d7fc2', '#f4a6cd'];
    var lastX = null, lastY = null, lastTime = 0;

    function drop(x, y) {
      var now = Date.now();
      if (now - lastTime < 55) return;                 // don't spam
      if (lastX !== null) {
        var dx = x - lastX, dy = y - lastY;
        if (Math.sqrt(dx * dx + dy * dy) < 16) return; // needs real movement
      }
      lastX = x; lastY = y; lastTime = now;

      var mark = document.createElement('span');
      if (ambient === 'petals') {
        mark.className = 'trail-petal';
        mark.innerHTML = petalSVG(10 + Math.random() * 8,
          PETAL_TINTS[Math.floor(Math.random() * PETAL_TINTS.length)], 0.85);
      } else {
        mark.className = 'trail-heart';
        mark.textContent = '♥';
        mark.style.color = colors[Math.floor(Math.random() * colors.length)];
        mark.style.fontSize = (0.6 + Math.random() * 0.6) + 'rem';
        mark.style.opacity = 0.55 + Math.random() * 0.35;
      }
      mark.style.left = x + 'px';
      mark.style.top = y + 'px';
      document.body.appendChild(mark);
      mark.addEventListener('animationend', function () { mark.remove(); });
    }

    window.addEventListener('pointermove', function (e) { drop(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      if (t) drop(t.clientX, t.clientY);
    }, { passive: true });
  })();

  /* ── the sealed envelope on a letter page ─── */
  (function sealedEnvelope() {
    var overlay = document.getElementById('envOverlay');
    var envelope = document.getElementById('envelope');
    if (!overlay || !envelope) return;

    var opened = false;
    function openLetter() {
      if (opened) return;
      opened = true;
      envelope.classList.add('open');
      setTimeout(function () {
        overlay.classList.add('done');
        document.body.classList.remove('locked');
        setTimeout(function () { overlay.remove(); }, reducedMotion ? 0 : 1100);
      }, reducedMotion ? 0 : 1500);
    }
    envelope.addEventListener('click', openLetter);
    envelope.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLetter(); }
    });
  })();

  /* ── handwriting: ink in one character at a time ── */
  (function handwriting() {
    var PACE = 0.045; // seconds per character
    document.querySelectorAll('.write').forEach(function (block) {
      var idx = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === Node.TEXT_NODE) {
            var frag = document.createDocumentFragment();
            child.textContent.split('').forEach(function (ch) {
              var span = document.createElement('span');
              span.className = 'ink';
              span.textContent = ch;
              if (!reducedMotion && ch.trim()) {
                span.style.transitionDelay = (idx++ * PACE) + 's';
              }
              frag.appendChild(span);
            });
            child.replaceWith(frag);
          } else if (child.tagName === 'BR') {
            idx += 5; // a small pause at each line break, like lifting the pen
          } else {
            walk(child);
          }
        });
      })(block);
    });
  })();

  /* ── reveal things as she scrolls to them ── */
  (function scrollReveal() {
    var writes = document.querySelectorAll('.write');
    var reveals = document.querySelectorAll('.reveal');
    var vines = document.querySelectorAll('.vine');
    if (!writes.length && !reveals.length && !vines.length) return;

    // each vine starts as an undrawn line
    vines.forEach(function (vine) {
      var stroke = vine.querySelector('.stroke');
      if (!stroke) return;
      var len = stroke.getTotalLength();
      stroke.style.strokeDasharray = len;
      stroke.style.strokeDashoffset = reducedMotion ? 0 : len;
    });

    function show(el) {
      if (el.classList.contains('vine')) {
        el.classList.add('drawn');
        var stroke = el.querySelector('.stroke');
        if (stroke) stroke.style.strokeDashoffset = 0;
      } else if (el.classList.contains('write')) {
        el.classList.add('written');
      } else {
        el.classList.add('visible');
      }
    }

    if (!('IntersectionObserver' in window)) {
      writes.forEach(show); reveals.forEach(show); vines.forEach(show);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    writes.forEach(function (el) { observer.observe(el); });
    reveals.forEach(function (el) { observer.observe(el); });
    vines.forEach(function (el) { observer.observe(el); });
  })();

  /* ── the countdown, ticking live ─────────── */
  (function countdown() {
    var el = document.getElementById('countdown');
    if (!el) return;

    var parts = (el.getAttribute('data-target') || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return;
    // local midnight at the start of that day, so it reads correctly
    // wherever she happens to be
    var target = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);

    var out = {
      days: el.querySelector('[data-cd="days"]'),
      hours: el.querySelector('[data-cd="hours"]'),
      minutes: el.querySelector('[data-cd="minutes"]')
    };
    if (!out.days || !out.hours || !out.minutes) return;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function tick() {
      var left = target - Date.now();
      if (left <= 0) { el.classList.add('arrived'); return true; }
      var mins = Math.floor(left / 60000);
      out.days.textContent = Math.floor(mins / 1440);
      out.hours.textContent = pad(Math.floor(mins % 1440 / 60));
      out.minutes.textContent = pad(mins % 60);
      return false;
    }

    if (tick()) return;
    var timer = setInterval(function () { if (tick()) clearInterval(timer); }, 1000);
  })();

  /* ── "keep this on your phone" tip ────────── */
  (function homeScreenTip() {
    var tip = document.getElementById('tip');
    if (!tip) return;

    var installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    var dismissed = false;
    try { dismissed = localStorage.getItem('tipDismissed') === '1'; } catch (e) {}
    if (installed || dismissed) return;

    var isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    tip.querySelector('.tip-text').innerHTML = isIOS
      ? 'keep me on your phone — tap <strong>Share</strong>, then <strong>Add to Home Screen</strong> ♡'
      : 'keep me on your phone — open your browser menu, then <strong>Add to Home screen</strong> ♡';
    tip.hidden = false;

    tip.querySelector('.tip-close').addEventListener('click', function () {
      tip.hidden = true;
      try { localStorage.setItem('tipDismissed', '1'); } catch (e) {}
    });
  })();

})();
