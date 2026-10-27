/* ═══════════════════════════════════════════
   For Rawan — the magazine (Letter No. VI)
   Stacks the pages of the issue and turns them
   like paper: each page swings about its left
   edge, following her finger as she swipes.
   She can also tap the edge of a page, use the
   arrows underneath, or the arrow keys.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  var issue = document.getElementById('issue');
  var pager = document.getElementById('pager');
  if (!issue || !pager) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sheets = Array.prototype.slice.call(issue.querySelectorAll('.sheet'));
  var count = sheets.length;
  var now = pager.querySelector('.now');
  var current = 0;
  var busy = false;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  // Every page gets a blank back, seen only while it's mid-turn, and a
  // shadow that deepens as it lifts away from the page underneath.
  sheets.forEach(function (sheet) {
    var back = document.createElement('div');
    back.className = 'face face-back';
    back.setAttribute('aria-hidden', 'true');
    sheet.appendChild(back);
    var shade = document.createElement('div');
    shade.className = 'turn-shade';
    sheet.querySelector('.face').appendChild(shade);
  });

  issue.classList.add('is-book');
  document.body.classList.add('booked');
  pager.querySelector('.of').textContent = pad(count);
  pager.hidden = false;

  /* ── drawing a page at an angle ──
     0 is lying flat on the pile, -180 is turned over to the left. A page
     at rest has no transform at all, which keeps scrolling inside it
     smooth on phones. */
  function pose(sheet, angle) {
    if (angle === 0 || angle === -180) {
      sheet.style.transform = '';
      sheet.classList.remove('moving');
    } else {
      sheet.style.transform = 'rotateY(' + angle.toFixed(2) + 'deg)';
      sheet.classList.add('moving');
    }
    sheet.classList.toggle('turned', angle === -180);
    var lift = Math.sin(-angle * Math.PI / 180);
    sheet.querySelector('.turn-shade').style.opacity = (lift * 0.35).toFixed(3);
  }

  function settle() {
    sheets.forEach(function (sheet, i) {
      pose(sheet, i < current ? -180 : 0);
      // the page on top of the pile sits highest; turned pages are hidden
      sheet.style.zIndex = i < current ? '' : String(count - i);
      sheet.classList.toggle('current', i === current);
      sheet.inert = i !== current;
      sheet.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    now.textContent = pad(current + 1);
    pager.querySelector('[data-turn="prev"]').disabled = current === 0;
    pager.querySelector('[data-turn="next"]').disabled = current === count - 1;
  }

  /* The page that moves for a turn: going forward it's the current page
     lifting off; going back it's the page before, coming back over. */
  function mover(dir) {
    return dir > 0 ? sheets[current] : sheets[current - 1];
  }
  function canTurn(dir) {
    return dir > 0 ? current < count - 1 : current > 0;
  }

  // where a page starts and ends for a turn in each direction
  function startAngle(dir) { return dir > 0 ? 0 : -180; }
  function endAngle(dir) { return dir > 0 ? -180 : 0; }

  /* While she drags, the page's free edge stays under her finger. That
     edge sits cos(angle) of the way across, so the angle is the arccos of
     how far her finger has come. A dragged page goes as far as standing on
     its edge; letting go carries it the rest of the way. */
  function angleFor(dir, progress) {
    var across = dir > 0 ? 1 - progress : progress;
    return -Math.acos(Math.max(0, Math.min(1, across))) * 180 / Math.PI;
  }

  function animate(sheet, from, to, done) {
    sheet.style.zIndex = String(count + 1);
    if (reducedMotion) { done(); return; }
    var duration = 900 * Math.abs(to - from) / 180 + 150;
    var start = null;
    busy = true;
    function step(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / duration);
      var eased = 1 - Math.pow(1 - k, 3);
      pose(sheet, from + (to - from) * eased);
      if (k < 1) { requestAnimationFrame(step); return; }
      busy = false;
      done();
    }
    requestAnimationFrame(step);
  }

  function finish(dir, from) {
    animate(mover(dir), from, endAngle(dir), function () {
      current += dir;
      settle();
      var face = sheets[current].querySelector('.face');
      if (face) face.scrollTop = 0;
    });
  }

  function turn(dir) {
    if (busy || !canTurn(dir)) return;
    finish(dir, startAngle(dir));
  }

  /* ── swiping: the page follows her finger ── */
  var drag = null;

  // a mouse drag across a photo would otherwise pick the photo up
  issue.addEventListener('dragstart', function (e) { e.preventDefault(); });

  issue.addEventListener('pointerdown', function (e) {
    if (busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { x: e.clientX, y: e.clientY, t: e.timeStamp, dir: 0, progress: 0, angle: 0, id: e.pointerId };
  });

  issue.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.dir) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
      var dir = dx < 0 ? 1 : -1;
      if (!canTurn(dir)) { drag = null; return; }
      drag.dir = dir;
      mover(dir).style.zIndex = String(count + 1);
      try { issue.setPointerCapture(e.pointerId); } catch (err) {}
    }
    drag.progress = Math.max(0, Math.min(1, (dx * -drag.dir) / issue.clientWidth));
    drag.angle = angleFor(drag.dir, drag.progress);
    drag.lastX = e.clientX;
    drag.lastT = e.timeStamp;
    pose(mover(drag.dir), drag.angle);
  });

  function release(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag;
    drag = null;
    if (!d.dir) {
      if (!cancelled) tap(e, d);
      return;
    }
    // a quick flick turns the page even if it hasn't gone far
    var speed = ((d.lastX || d.x) - d.x) * -d.dir / Math.max(1, (d.lastT || d.t) - d.t);
    var go = !cancelled && (d.progress > 0.3 || speed > 0.5);
    if (go) {
      finish(d.dir, d.angle);
    } else {
      animate(mover(d.dir), d.angle, startAngle(d.dir), settle);
    }
  }
  issue.addEventListener('pointerup', function (e) { release(e, false); });
  issue.addEventListener('pointercancel', function (e) { release(e, true); });

  // tapping near either edge of a page turns it, like reaching for the corner
  function tap(e, d) {
    if (Math.abs(e.clientX - d.x) > 6 || Math.abs(e.clientY - d.y) > 6) return;
    if (e.target.closest('a, button')) return;
    var box = issue.getBoundingClientRect();
    var x = (e.clientX - box.left) / box.width;
    if (x > 0.78) turn(1);
    else if (x < 0.22) turn(-1);
  }

  /* ── the arrows, the cover's button, and the keyboard ── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-turn]');
    if (!btn) return;
    turn(btn.getAttribute('data-turn') === 'next' ? 1 : -1);
  });

  document.addEventListener('keydown', function (e) {
    if (document.body.classList.contains('locked')) return;  // still in the envelope
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); turn(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); turn(-1); }
  });

  settle();
})();
