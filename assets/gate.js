/* ═══════════════════════════════════════════
   For Rawan — the password gate
   Loaded in the <head> of every page, before
   anything is drawn, so nothing shows until the
   password has been given once on this device.
   ═══════════════════════════════════════════ */

(function () {
  // SHA-256 of the password. To change the password, replace this with the
  // output of:  printf '%s' 'new password' | sha256sum
  var HASH = '9776d4bb74c54e8136a59652a4c67a94d4da2c8718f07eea6fe8f3819313be59';
  var KEY = 'gate';

  var remembered = null;
  try { remembered = localStorage.getItem(KEY); } catch (e) {}
  if (remembered === HASH) return;

  var root = document.documentElement;
  root.classList.add('gated');

  // Hide the page itself straight away, before styles.css has even loaded.
  var hide = document.createElement('style');
  hide.textContent =
    'html.gated body > *:not(.gate) { display: none !important; }' +
    'html.gated body { overflow: hidden; }';
  document.head.appendChild(hide);

  function sha256(text) {
    var bytes = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }

  function build() {
    var gate = document.createElement('div');
    gate.className = 'gate';
    gate.innerHTML =
      '<form class="gate-card" autocomplete="on">' +
        '<span class="gate-seal" aria-hidden="true">💌</span>' +
        '<h1 class="gate-title">For Rawan</h1>' +
        '<p class="gate-sub">this little box is sealed ♡</p>' +
        '<label class="gate-label" for="gate-pw">password</label>' +
        '<input class="gate-input" id="gate-pw" name="password" type="password"' +
          ' autocomplete="current-password" autocapitalize="off" spellcheck="false" required>' +
        '<button class="gate-btn" type="submit">open</button>' +
        '<p class="gate-error" role="alert" aria-live="polite"></p>' +
      '</form>';
    document.body.appendChild(gate);

    var form = gate.querySelector('form');
    var input = gate.querySelector('input');
    var error = gate.querySelector('.gate-error');
    input.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!window.crypto || !crypto.subtle) {
        error.textContent = 'this page needs to be opened over https';
        return;
      }
      sha256(input.value).then(function (hash) {
        if (hash !== HASH) {
          error.textContent = 'not quite — try again';
          form.classList.remove('shake');
          void form.offsetWidth;
          form.classList.add('shake');
          input.select();
          return;
        }
        try {
          localStorage.setItem(KEY, hash);
        } catch (err) {
          // Storage is blocked (private browsing), so it can't be remembered:
          // just open this page as it is.
          gate.remove();
          hide.remove();
          root.classList.remove('gated');
          return;
        }
        // Start the page fresh, so its animations play from the beginning.
        location.reload();
      });
    });
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
