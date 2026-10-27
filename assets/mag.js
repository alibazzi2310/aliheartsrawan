/* ═══════════════════════════════════════════
   For Rawan — the magazine (Letter No. VI)
   Keeps the lookbook's "01 / 04" in step with
   the swipe, and counts down to the look kept
   under embargo until the Toulbeh.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  /* ── the lookbook: the page count follows the swipe ── */
  (function lookbook() {
    var track = document.querySelector('.lookbook');
    var count = document.querySelector('.look-count');
    if (!track || !count) return;
    var looks = track.querySelectorAll('.look');
    var now = count.querySelector('.now');
    count.querySelector('.of').textContent = pad(looks.length);

    function update() {
      var mid = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      looks.forEach(function (look, i) {
        var dist = Math.abs(look.offsetLeft + look.offsetWidth / 2 - mid);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      now.textContent = pad(best + 1);
    }

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ── the embargoed look: days until it's lifted ── */
  (function embargo() {
    var look = document.querySelector('[data-embargo]');
    if (!look) return;

    var parts = look.getAttribute('data-embargo').split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return;
    var lift = new Date(parts[0], parts[1] - 1, parts[2]);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    // whole calendar days, so it ticks over at her midnight
    var days = Math.round((lift - today) / 86400000);

    var out = look.querySelector('.embargo-days');
    if (days <= 0) {
      look.classList.add('lifted');
      if (out) out.textContent = 'the photo is on its way';
      return;
    }
    if (out) out.textContent = days === 1 ? 'tomorrow' : 'in ' + days + ' days';
  })();

})();
