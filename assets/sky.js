/* ═══════════════════════════════════════════
   For Rawan — the constellations
   Join two stars to draw a line: either drag
   from one to the other, or tap one and then
   the other. Finish a constellation and it
   lights up and names a dream. Finish all
   three and the letter below unlocks.
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
      name: 'The Home',
      tag: 'Our Dream Home',
      dream: 'a home of our own, and you filling it with candlelight',
      stars: [[30, 72], [70, 72], [70, 50], [30, 50], [50, 28]],
      edges: [[0, 1], [1, 2], [2, 4], [4, 3], [3, 0]]
    },
    {
      name: 'The Wanderer',
      tag: 'Our Dream to Travel the World',
      dream: 'getting lost together, somewhere neither of us has been',
      stars: [[16, 64], [34, 40], [54, 58], [72, 34], [86, 54]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4]]
    },
    {
      name: 'The Cradle',
      tag: 'Our Dream to Start a Family',
      dream: 'small feet in the hallway, and your eyes looking back at me',
      stars: [[22, 38], [31, 62], [50, 72], [69, 62], [78, 38]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4]]
    },
    {
      name: 'The Atelier',
      tag: 'Our Dream to Start a Fashion Brand',
      dream: 'your name on the label, and me in the front row',
      stars: [[50, 26], [38, 46], [28, 74], [72, 74], [62, 46]],
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
        '<svg class="sky-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
          '<line class="sky-drag" x1="0" y1="0" x2="0" y2="0"></line>' +
        '</svg>' +
        '<div class="sky-stars"></div>' +
      '</div>' +
      '<p class="sky-name">' + sky.name + '</p>' +
      '<p class="sky-tag">' + sky.tag + '</p>' +
      '<p class="sky-dream">' + sky.dream + '</p>';
    host.appendChild(card);
    if (revealer) revealer.observe(card); else card.classList.add('visible');

    var panel = card.querySelector('.sky-panel');
    var svg = card.querySelector('.sky-lines');
    var dragLine = card.querySelector('.sky-drag');
    var field = card.querySelector('.sky-stars');
    var drawn = [];
    var picked = null;
    var chain = null;
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
      b.setAttribute('aria-label', 'Star ' + (i + 1) + ' of ' + sky.stars.length + ', ' + sky.name);
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
      starEls.forEach(function (el, i) { el.classList.toggle('picked', picked === i || chain === i); });
      lines.forEach(function (ln, i) { ln.classList.toggle('drawn', drawn[i]); });
    }

    function nope(i) {
      var el = starEls[i];
      el.classList.add('nope');
      setTimeout(function () { el.classList.remove('nope'); }, 420);
    }

    function finish(animate) {
      card.classList.add('lit');
      starEls.forEach(function (el) { el.disabled = true; });
      done[si] = true;
      remember();
      refreshLock(animate);
    }

    // draws the line between two stars if there is one to draw;
    // `quiet` skips the nudge, for when she is mid-trace
    function connect(a, b, quiet) {
      var e = edgeIndex(a, b);
      if (e === -1 || drawn[e]) { if (!quiet) nope(b); return false; }
      drawn[e] = true;
      paint();
      if (drawn.every(Boolean)) finish(true);
      return true;
    }

    /* ── tapping: one star, then another ── */
    function tap(i) {
      if (card.classList.contains('lit')) return;
      if (picked === null) { picked = i; paint(); return; }
      if (picked === i) { picked = null; paint(); return; }
      picked = connect(picked, i) ? null : i;
      paint();
    }

    /* ── tracing: hold one star and run through the rest without
          lifting. Every star the finger passes becomes the new end of
          the line, and any real edge it crosses gets drawn, so a whole
          constellation can be done in a single stroke. ── */
    var moved = false, swallowClick = false, last = null;

    function pct(e) {
      var r = panel.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100];
    }
    /* Which stars did the stroke just sweep across? Testing only the
       latest pointer position misses stars when the finger moves fast
       between samples, so this measures each star against the whole
       segment travelled and returns them in the order they were met. */
    function starsCrossed(from, to) {
      var r = panel.getBoundingClientRect();
      function px(pt) { return [pt[0] / 100 * r.width, pt[1] / 100 * r.height]; }
      var a = px(from), b = px(to);
      var vx = b[0] - a[0], vy = b[1] - a[1];
      var len2 = vx * vx + vy * vy;
      var hits = [];
      sky.stars.forEach(function (star, i) {
        var c = px(star);
        var t = len2 ? ((c[0] - a[0]) * vx + (c[1] - a[1]) * vy) / len2 : 0;
        t = Math.max(0, Math.min(1, t));
        var dx = a[0] + vx * t - c[0], dy = a[1] + vy * t - c[1];
        if (Math.sqrt(dx * dx + dy * dy) <= 18) hits.push({ i: i, t: t });
      });
      hits.sort(function (x, y) { return x.t - y.t; });
      return hits.map(function (h) { return h.i; });
    }
    function endTrace() {
      chain = null;
      last = null;
      dragLine.classList.remove('active');
      paint();
    }

    starEls.forEach(function (el, i) {
      el.addEventListener('click', function () {
        if (swallowClick) { swallowClick = false; return; }
        tap(i);
      });

      el.addEventListener('pointerdown', function (e) {
        if (card.classList.contains('lit')) return;
        chain = i;
        moved = false;
        last = sky.stars[i];
        paint();
        // capture, so the pointer keeps reporting here once it leaves the star
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
      });

      el.addEventListener('pointermove', function (e) {
        if (chain === null) return;
        var p = pct(e);
        var from = sky.stars[chain];
        var dx = p[0] - from[0], dy = p[1] - from[1];
        if (!moved && Math.sqrt(dx * dx + dy * dy) < 2) return;   // ignore a wobble
        moved = true;

        var crossed = starsCrossed(last, p);
        for (var k = 0; k < crossed.length; k++) {
          var j = crossed[k];
          if (j === chain) continue;
          connect(chain, j, true);   // quiet — no nudge while she is tracing
          chain = j;                 // the line carries on from the star she reached
          if (card.classList.contains('lit')) { picked = null; last = p; endTrace(); return; }
        }
        last = p;

        var f = sky.stars[chain];
        dragLine.setAttribute('x1', f[0]);
        dragLine.setAttribute('y1', f[1]);
        dragLine.setAttribute('x2', p[0]);
        dragLine.setAttribute('y2', p[1]);
        dragLine.classList.add('active');
        paint();
      });

      el.addEventListener('pointerup', function () {
        if (chain === null) return;
        if (moved) { swallowClick = true; picked = null; }
        endTrace();
      });

      el.addEventListener('pointercancel', function () { picked = null; endTrace(); });
    });

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
