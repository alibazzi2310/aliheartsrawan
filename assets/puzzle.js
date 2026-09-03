/* ═══════════════════════════════════════════
   For Rawan — the picture puzzles
   Three 3x3 boards. Tap one piece, then another,
   to swap them. Solve all three and the letter
   at the bottom unlocks.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  var boards = Array.prototype.slice.call(document.querySelectorAll('.puzzle-card'));
  if (!boards.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'rawan-puzzles-solved';
  var N = 3;                                  // 3 x 3 pieces
  var solved = restore();

  function restore() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(v) && v.length === boards.length) return v;
    } catch (e) {}
    return boards.map(function () { return false; });
  }
  function remember() {
    try { localStorage.setItem(KEY, JSON.stringify(solved)); } catch (e) {}
  }

  var vault = document.getElementById('vault');
  var pips = document.querySelectorAll('.pip');
  var countEl = document.querySelector('[data-solved-count]');

  function refreshLock(animate) {
    var done = solved.filter(Boolean).length;
    pips.forEach(function (p, i) { p.classList.toggle('lit', i < done); });
    if (countEl) countEl.textContent = done;
    if (vault) {
      vault.classList.toggle('open', done === boards.length);
      if (done === boards.length && animate && !reduced) {
        vault.classList.add('just-opened');
        vault.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  boards.forEach(function (card, index) {
    var board = card.querySelector('.puzzle');
    var grid = card.querySelector('.tiles');
    var peekLayer = card.querySelector('.peek-layer');
    var peekBtn = card.querySelector('.peek-btn');
    var src = board.getAttribute('data-src');
    var order = [];                            // order[slot] = which piece sits there
    var picked = null;
    var tiles = [];

    peekLayer.style.backgroundImage = 'url("' + src + '")';

    for (var i = 0; i < N * N; i++) {
      var t = document.createElement('button');
      t.type = 'button';
      t.className = 'tile';
      t.style.backgroundImage = 'url("' + src + '")';
      grid.appendChild(t);
      tiles.push(t);
      bind(t, i);
    }

    function bind(tile, slot) {
      tile.addEventListener('click', function () { tap(slot); });
    }

    function displaced() {
      var n = 0;
      for (var i = 0; i < order.length; i++) if (order[i] !== i) n++;
      return n;
    }

    function isSolved() {
      for (var i = 0; i < order.length; i++) if (order[i] !== i) return false;
      return true;
    }

    function paint() {
      for (var s = 0; s < order.length; s++) {
        var piece = order[s];
        var col = piece % N, row = Math.floor(piece / N);
        tiles[s].style.backgroundPosition =
          (col * 100 / (N - 1)) + '% ' + (row * 100 / (N - 1)) + '%';
        tiles[s].classList.toggle('picked', picked === s);
        tiles[s].setAttribute('aria-label', 'Piece ' + (piece + 1) + ' of ' + (N * N));
        tiles[s].disabled = card.classList.contains('solved');
      }
    }

    function shuffle() {
      order = [];
      for (var i = 0; i < N * N; i++) order.push(i);
      // reshuffle until it actually looks jumbled: a scramble that leaves
      // most pieces already home is no fun to be handed
      do {
        for (var j = order.length - 1; j > 0; j--) {
          var k = Math.floor(Math.random() * (j + 1));
          var tmp = order[j]; order[j] = order[k]; order[k] = tmp;
        }
      } while (displaced() < order.length - 2);
    }

    function win() {
      card.classList.add('solved');
      solved[index] = true;
      remember();
      paint();
      refreshLock(true);
      if (!reduced) celebrate();
    }

    function celebrate() {
      var rect = board.getBoundingClientRect();
      for (var i = 0; i < 14; i++) {
        var s = document.createElement('span');
        s.className = 'confetti-heart';
        s.textContent = ['💜', '💗', '✨', '🩷'][i % 4];
        s.style.left = (rect.left + Math.random() * rect.width) + 'px';
        s.style.top = (rect.top + rect.height * 0.4 + Math.random() * rect.height * 0.3) + 'px';
        s.style.setProperty('--dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
        s.style.animationDelay = (Math.random() * 0.25).toFixed(2) + 's';
        document.body.appendChild(s);
        s.addEventListener('animationend', function () { this.remove(); });
      }
    }

    function tap(slot) {
      if (card.classList.contains('solved')) return;
      if (picked === null) { picked = slot; paint(); return; }
      if (picked === slot) { picked = null; paint(); return; }
      var tmp = order[picked]; order[picked] = order[slot]; order[slot] = tmp;
      picked = null;
      paint();
      if (isSolved()) win();
    }

    // peek: hold the button (or the board) to see the finished picture
    function peekOn(e) { if (e) e.preventDefault(); board.classList.add('peek'); }
    function peekOff() { board.classList.remove('peek'); }
    if (peekBtn) {
      ['mousedown', 'touchstart'].forEach(function (ev) { peekBtn.addEventListener(ev, peekOn, { passive: false }); });
      ['mouseup', 'mouseleave', 'touchend', 'touchcancel', 'blur'].forEach(function (ev) { peekBtn.addEventListener(ev, peekOff); });
      peekBtn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') peekOn(e); });
      peekBtn.addEventListener('keyup', peekOff);
    }

    if (solved[index]) {
      for (var q = 0; q < N * N; q++) order.push(q);
      card.classList.add('solved');
    } else {
      shuffle();
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
