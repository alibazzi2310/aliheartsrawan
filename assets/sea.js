/* ═══════════════════════════════════════════
   For Rawan — Letter No. V, the sea
   Plays Ali reading the letter, and lights up
   each line as he reaches it. A line follows
   along only if it has data-at="seconds".
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

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* the lines that have a start time, in the order he reads them */
  var lines = Array.prototype.slice.call(document.querySelectorAll('.sea-line[data-at]'))
    .map(function (el) { return { el: el, at: parseFloat(el.getAttribute('data-at')) }; })
    .filter(function (l) { return !isNaN(l.at); })
    .sort(function (a, b) { return a.at - b.at; });
  var current = null;
  if (lines.length) document.body.classList.add('following');

  function clock(s) {
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }

  /* until the recording is in the repo, say so gently instead of a dead button */
  function unavailable() {
    voice.classList.add('voice-missing');
    button.disabled = true;
    sub.textContent = 'my voice is on its way ♡';
  }
  audio.addEventListener('error', unavailable);
  if (audio.error) unavailable();

  function showLength() {
    if (isFinite(audio.duration)) sub.textContent = 'in my voice · ' + clock(audio.duration);
  }
  audio.addEventListener('loadedmetadata', showLength);
  if (audio.readyState >= 1) showLength();

  button.addEventListener('click', function () {
    if (audio.paused) audio.play(); else audio.pause();
  });

  audio.addEventListener('play', function () {
    voice.classList.add('playing');
    document.body.classList.add('listening');
    button.setAttribute('aria-label', 'Pause');
  });
  audio.addEventListener('pause', function () {
    voice.classList.remove('playing');
    button.setAttribute('aria-label', 'Play Ali reading the letter');
  });
  audio.addEventListener('ended', function () {
    document.body.classList.remove('listening');
    setCurrent(null);
    ring.style.strokeDashoffset = RING;
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

  audio.addEventListener('timeupdate', function () {
    if (isFinite(audio.duration) && audio.duration > 0) {
      ring.style.strokeDashoffset = RING * (1 - audio.currentTime / audio.duration);
    }
    if (!lines.length) return;
    var found = null;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].at <= audio.currentTime + 0.05) found = lines[i];
      else break;
    }
    setCurrent(found);
  });

  /* tapping a line jumps the recording to it */
  lines.forEach(function (line) {
    line.el.classList.add('seekable');
    line.el.addEventListener('click', function () {
      if (voice.classList.contains('voice-missing')) return;
      audio.currentTime = line.at;
      lastManualScroll = Date.now();
      if (audio.paused) audio.play();
    });
  });
})();
