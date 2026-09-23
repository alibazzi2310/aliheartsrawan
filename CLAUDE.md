# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A private gift: a static "keepsake box" of love letters from Ali to Rawan, hosted free
on GitHub Pages at `https://alibazzi2310.github.io/aliheartsrawan/`.

Two consequences shape everything:

- **Hand-written static files only.** No build step, no framework, no package.json, no CI.
  Every file in the repo is served exactly as committed. Anything that would require a
  build, a server or a paid service breaks the "free forever" property that is the whole
  point. Browser `localStorage` is the only persistence available.
- **The repository is public**, which is what makes Pages free. It contains photographs of
  the couple. Strip EXIF from any image before committing (phone photos carry GPS), and
  confirm with the user before adding new photos of people.

## Working on it

There is nothing to install or build. To see a page:

```bash
python3 -m http.server 8899      # then open http://127.0.0.1:8899/
```

Relative paths matter — the site is served from a subpath on Pages, so every reference is
relative (`assets/…` from the root, `../assets/…` from inside `letters/`). Never use a
leading slash.

### Verifying a change

These pages are animation and interaction; unit tests would not catch what goes wrong.
Drive the real page in a browser and **look at a screenshot** — several bugs here passed
automated checks while being completely invisible or unusable on screen. Chromium is
pre-installed:

```bash
node -e "require('playwright').chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })"
```

Test at a phone viewport (390×844) as well as desktop — she reads this on a phone.

Two environment quirks worth knowing:

- The sandboxed browser **cannot reach Google Fonts**, so screenshots fall back to a plain
  serif and the cursive script will be missing. `curl` *can* reach it, so the fonts can be
  downloaded and installed into `/usr/share/fonts` to make screenshots truthful.
- `github.io` is blocked from the sandbox, so the live site cannot be fetched to verify a
  deploy.

### Shipping

Work on a branch, open a PR, and merge only when the user asks. Pushing to `main`
republishes the live site immediately, and the user's wife may be reading it.

## Architecture

```
index.html          the keepsake box: greeting, Toulbeh countdown, shelf of letter cards
letters/*.html      one letter per file, each with its own gimmick
assets/styles.css   every style for every page
assets/app.js       every shared behaviour, loaded by every page
assets/puzzle.js    the photo puzzles — loaded only by no-3
assets/sky.js       the constellations — loaded only by no-4
```

A letter is a standalone HTML file that links the shared CSS and JS and then composes
existing classes. Adding one means writing the file and adding a card to the shelf in
`index.html`; styling and animation come along for free.

### The token system

All colour lives in custom properties on `:root` in `styles.css`. Components reference
tokens, never literals. This is what lets `body.night` (Letter IV) re-skin the entire
page — letter card, pips, sealed vault — by redefining the same tokens, with no
page-specific overrides. Keep new components on tokens so future re-skins stay cheap.

### app.js is a set of independent, self-disabling modules

Each IIFE (`timeGreeting`, `floaties`, `heartTrail`, `sealedEnvelope`, `handwriting`,
`scrollReveal`, `countdown`, `homeScreenTip`) looks for the element it needs and returns
immediately if the page doesn't have one. That is why one script can serve a countdown
page, a puzzle page and a night sky without branching on which page it is. Preserve this
when adding behaviour.

### Shared markup contracts

- **`data-ambient` on `<body>`** picks the drifting shapes: absent = hearts, `petals`
  (Letter II), `stars` (Letter IV). The finger-trail follows the same setting.
- **`.write`** on a block makes its text ink in character by character as it scrolls into
  view. `<br>` inserts a pause, like lifting a pen.
- **`.reveal`** fades an element up on scroll.
- **`.vault` + `.pip` + `[data-solved-count]`** is the lock pattern shared by Letters III
  and IV: a sealed card that hides a letter until a game is finished. Both games drive it
  through the same class names.
- **Progress is stored per game** under `rawan-puzzles-solved` and `rawan-constellations`,
  as an array of booleans. Every read and write is wrapped in try/catch — private mode
  throws. A `[data-reset]` button clears the key and reloads.

### Traps that have already bitten

- **`.reveal` elements created at runtime are never revealed.** `app.js` collects them
  once at load, so anything a later script builds (as `sky.js` does) stays at opacity 0 —
  functional, invisible, and silent in automated checks. Such a script must run its own
  IntersectionObserver; `sky.js` shows the pattern.
- **The wax-seal "R" is an inlined SVG outline of the Great Vibes glyph**, duplicated in
  every page, with its `viewBox` set to the glyph's exact ink bounds. It is not live text:
  centring the character box leaves the cursive R visibly off-centre, and a separate file
  left the seal briefly empty on a slow phone connection. Copy the existing `<svg
  class="seal-mark">` block when adding a page.
- **SVG `transform` attributes and the CSS `transform` property are the same property.**
  A CSS transform on an element silently wipes out its attribute positioning; wrap the
  positioning on a parent `<g>` instead.
- **Pointer sampling is not a substitute for geometry.** `sky.js` decides which stars a
  stroke crossed by measuring each star against the whole segment travelled, because
  testing only the reported pointer positions misses stars on a fast swipe — the same
  gesture drew five lines slowly and none quickly.

## Content conventions

Read `README.md` for the per-letter authoring steps. Beyond those:

- Every letter closes on her name in script (`<span class="her-name">`), then
  "I love you." / "from Ali".
- Each letter has exactly one gimmick, and no two repeat: sealed envelope and handwriting
  (I), flowers with drawn vines and a florist's care tag (II), photo puzzles (III), a
  night sky of constellations (IV).
- The prose is the user's. Fix mechanics — grammar, hyphenation, a clause that does not
  parse — and flag anything larger as a suggestion rather than applying it.
- Respect `prefers-reduced-motion` in every new animation; the stylesheet has a block for
  it at the end of each section.
