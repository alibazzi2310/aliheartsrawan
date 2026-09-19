/* ═══════════════════════════════════════════
   For Rawan — the constellations
   Tap one star, then another, to join them.
   Finish a constellation and it lights up and
   names a dream. Finish all three and the
   letter below unlocks.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  var host = document.getElementById('sky');
  if (!host) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'rawan-constellations';

  /* ── PLACEHOLDERS — replace `dream` with the real ones.
        Stars are [x, y] as percentages of the panel; edges join them
        by index. Keep every star used by at least one edge. ── */
  var SKIES = [
    {
      name: 'The House',
      dream: 'a home with a red door, and the noise of you in it',
      stars: [[28, 74], [72, 74], [72, 46], [28, 46], [50, 24]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 2]]
    },
    {
      name: 'The Wanderer',
      dream: 'waking up somewhere neither of us has been',
      stars: [[16, 62], [37, 38], [58, 54], [82, 30], [64, 76]],
      edges: [[0, 1], [1, 2], [2, 3], [2, 4]]
    },
    {
      name: 'The Long Table',
      dream: 'a table too small for everyone we love',
      stars: [[22, 36], [50, 26], [78, 36], [68, 70], [32, 70]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
    }
  ];

  var done = restore();
  function restore() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(v) && v.length === SKIES.length) return v;
    } catch (e) {}
    return SKIES.map(function () { return false; });
  }
  function remember() {
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
  }

  var vault = document.getElementById('vault');
  var pips = document.querySelectorAll('.pip');
  var countEl = document.querySelector('[data-solved-count]');

  function refreshLock(animate) {
    var n = done.filter(Boolean).length;
    pips.forEach(function (p, i) { p.classList.toggle('lit', i < n); });
    if (countEl) countEl.textContent = n;
    if (!vault) return;
    vault.classList.toggle('open', n === SKIES.length);
    if (n === SKIES.length && animate && !reduced) {
      vault.classList.add('just-opened');
      vault.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  var NS = 'http://www.w3.org/2000/svg';

  /* These cards are built after app.js has already collected its .reveal
     elements, so they would never be observed and would sit at opacity 0
     forever. This page reveals its own. */
  var revealer = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('visible');
          revealer.unobserve(e.target);
        });
      }, { threshold: 0.15 })
    : null;

  SKIES.forEach(function (sky, si) {
    var card = document.createElement('section');
    card.className = 'sky-card reveal';
    card.innerHTML =
      '<div class="sky-panel">' +
        '<svg class="sky-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>' +
        '<div class="sky-stars"></div>' +
      '</div>' +
      '<p class="sky-name">' + sky.name + '</p>' +
      '<p class="sky-dream">' + sky.dream + '</p>';
    host.appendChild(card);
    if (revealer) revealer.observe(card); else card.classList.add('visible');

    var svg = card.querySelector('.sky-lines');
    var field = card.querySelector('.sky-stars');
    var drawn = [];                       // one flag per edge
    var picked = null;
    var lines = [];

    sky.edges.forEach(function (e) {
      var a = sky.stars[e[0]], b = sky.stars[e[1]];
      var ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', a[0]); ln.setAttribute('y1', a[1]);
      ln.setAttribute('x2', b[0]); ln.setAttribute('y2', b[1]);
      ln.setAttribute('class', 'sky-line');
      svg.appendChild(ln);
      lines.push(ln);
      drawn.push(false);
    });

    var starEls = sky.stars.map(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'star';
      b.style.left = s[0] + '%';
      b.style.top = s[1] + '%';
      b.setAttribute('aria-label', 'Star ' + (i + 1) + ' of ' + sky.stars.length +
                     ', ' + sky.name);
      b.addEventListener('click', function () { tap(i); });
      field.appendChild(b);
      return b;
    });

    function edgeIndex(a, b) {
      for (var i = 0; i < sky.edges.length; i++) {
        var e = sky.edges[i];
        if ((e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)) return i;
      }
      return -1;
    }

    function paint() {
      starEls.forEach(function (el, i) { el.classList.toggle('picked', picked === i); });
      lines.forEach(function (ln, i) { ln.classList.toggle('drawn', drawn[i]); });
    }

    function finish(animate) {
      card.classList.add('lit');
      starEls.forEach(function (el) { el.disabled = true; });
      done[si] = true;
      remember();
      refreshLock(animate);
    }

    function tap(i) {
      if (card.classList.contains('lit')) return;
      if (picked === null) { picked = i; paint(); return; }
      if (picked === i) { picked = null; paint(); return; }
      var e = edgeIndex(picked, i);
      if (e === -1 || drawn[e]) {
        // not a line in this constellation — shrug it off and reselect
        var wrong = starEls[i];
        wrong.classList.add('nope');
        setTimeout(function () { wrong.classList.remove('nope'); }, 420);
        picked = i;
        paint();
        return;
      }
      drawn[e] = true;
      picked = null;
      paint();
      if (drawn.every(Boolean)) finish(true);
    }

    if (done[si]) {
      drawn = drawn.map(function () { return true; });
      card.classList.add('no-anim');
      finish(false);
      setTimeout(function () { card.classList.remove('no-anim'); }, 50);
    }
    paint();
  });

  var resetBtn = document.querySelector('[data-reset]');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      window.location.reload();
    });
  }

  refreshLock(false);
})();
