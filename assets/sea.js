/* ═══════════════════════════════════════════
   For Rawan — Letter No. V, the sea
   Plays Ali reading the letter one line at a
   time. Each .sea-line names its own clip in
   data-src; they play in order, and the line
   being read lights up. Tapping a line plays
   from there.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  var voice = document.getElementById('voice');
  var audio = document.getElementById('voiceAudio');
  if (!voice || !audio) return;

  var button = voice.querySelector('.voice-play');
  var ring = voice.querySelector('.ring-fill');
  var sub = voice.querySelector('.voice-sub');
  var RING = 2 * Math.PI * 21;
  ring.style.strokeDasharray = RING;
  ring.style.strokeDashoffset = RING;

  /* a breath between lines, and a longer one between verses */
  var PAUSE_LINE = 700;
  var PAUSE_VERSE = 1400;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var lines = Array.prototype.slice.call(document.querySelectorAll('.sea-line[data-src]'))
    .map(function (el) {
      // a line opens a new verse when a divider sits right before it
      var prev = el.previousElementSibling;
      return { el: el, src: el.getAttribute('data-src'), newVerse: !!(prev && prev.classList.contains('ripple')) };
    });
  if (!lines.length) return;
  document.body.classList.add('following');

  var index = -1;       // the line loaded into the player
  var started = false;  // has she pressed play yet
  var waiting = null;   // the pause before the next line
  var current = null;

  /* until the recordings are in the repo, say so gently instead of a dead button */
  function unavailable() {
    voice.classList.add('voice-missing');
    button.disabled = true;
    sub.textContent = 'my voice is on its way ♡';
  }

  function load(i) {
    index = i;
    audio.src = lines[i].src;
  }

  function playLine(i) {
    clearTimeout(waiting);
    waiting = null;
    started = true;
    load(i);
    setCurrent(lines[i]);
    var p = audio.play();
    if (p && p.catch) p.catch(function () {});
  }

  function finish() {
    clearTimeout(waiting);
    waiting = null;
    started = false;
    voice.classList.remove('playing');
    document.body.classList.remove('listening');
    button.setAttribute('aria-label', 'Play Ali reading the letter');
    setCurrent(null);
    ring.style.strokeDashoffset = RING;
    load(0);
  }

  function next() {
    var n = index + 1;
    if (n >= lines.length) { finish(); return; }
    // keep the next line lit through the pause, so the page moves on with him
    setCurrent(lines[n]);
    waiting = setTimeout(function () { playLine(n); }, lines[n].newVerse ? PAUSE_VERSE : PAUSE_LINE);
  }

  // before she presses play, the first clip tells us whether the recordings exist
  audio.addEventListener('error', function () {
    if (!started) unavailable();
    else next();          // a missing line is skipped rather than stopping the letter
  });
  load(0);

  button.addEventListener('click', function () {
    if (waiting) {                       // paused in the breath between lines
      clearTimeout(waiting);
      waiting = null;
      voice.classList.remove('playing');
      button.setAttribute('aria-label', 'Play Ali reading the letter');
      return;
    }
    if (!started) { playLine(0); return; }
    if (audio.paused) {
      // resuming after a pause that fell between lines: go on to the lit one
      if (audio.ended || (current && current !== lines[index])) playLine(lines.indexOf(current));
      else audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', function () {
    voice.classList.add('playing');
    document.body.classList.add('listening');
    button.setAttribute('aria-label', 'Pause');
  });
  audio.addEventListener('pause', function () {
    if (waiting || audio.ended) return;  // the end of a line, or the gap after it, isn't a pause
    voice.classList.remove('playing');
    button.setAttribute('aria-label', 'Play Ali reading the letter');
  });
  audio.addEventListener('ended', function () {
    // stay looking "playing" through the breath before the next line
    next();
  });

  audio.addEventListener('timeupdate', function () {
    var part = isFinite(audio.duration) && audio.duration > 0 ? audio.currentTime / audio.duration : 0;
    ring.style.strokeDashoffset = RING * (1 - (index + part) / lines.length);
  });

  /* ── following along ── */
  var lastManualScroll = 0;
  ['wheel', 'touchmove'].forEach(function (type) {
    window.addEventListener(type, function () { lastManualScroll = Date.now(); }, { passive: true });
  });

  function setCurrent(line) {
    if (line === current) return;
    if (current) current.el.classList.remove('now');
    current = line;
    if (!line) return;
    line.el.classList.add('now');
    // bring the line into view, unless she has just scrolled somewhere herself
    if (Date.now() - lastManualScroll > 4000) {
      var r = line.el.getBoundingClientRect();
      if (r.top < 90 || r.bottom > window.innerHeight - 40) {
        line.el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
    }
  }

  /* tapping a line plays it, and carries on from there */
  lines.forEach(function (line, i) {
    line.el.classList.add('seekable');
    line.el.addEventListener('click', function () {
      if (voice.classList.contains('voice-missing')) return;
      lastManualScroll = Date.now();
      playLine(i);
    });
  });
})();
