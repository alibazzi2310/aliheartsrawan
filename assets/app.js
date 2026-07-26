/* ═══════════════════════════════════════════
   For Rawan — shared behaviour
   Every piece below no-ops gracefully if the
   element it needs isn't on the page, so the
   box and the letters can share one file.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ── floating hearts & sparkles ───────────── */
  (function floaties() {
    var container = document.querySelector('.floaties');
    if (!container || reducedMotion) return;
    var symbols = ['💜', '💗', '🩷', '✨', '🌸', '💕'];
    var small = window.innerWidth < 640;        // gentler on a phone screen
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

      var heart = document.createElement('span');
      heart.className = 'trail-heart';
      heart.textContent = '♥';
      heart.style.left = x + 'px';
      heart.style.top = y + 'px';
      heart.style.color = colors[Math.floor(Math.random() * colors.length)];
      heart.style.fontSize = (0.6 + Math.random() * 0.6) + 'rem';
      heart.style.opacity = 0.55 + Math.random() * 0.35;
      document.body.appendChild(heart);
      heart.addEventListener('animationend', function () { heart.remove(); });
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
    if (!writes.length && !reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      writes.forEach(function (el) { el.classList.add('written'); });
      reveals.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(entry.target.classList.contains('write') ? 'written' : 'visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    writes.forEach(function (el) { observer.observe(el); });
    reveals.forEach(function (el) { observer.observe(el); });
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
