# aliheartsrawan 💌

A little keepsake box of letters for Rawan.

## Hosting it for free with GitHub Pages

GitHub Pages is **completely free** for public repositories — no credit card, no
hosting bill, ever. This site is plain static HTML/CSS/JS, so there is nothing
to build and nothing to pay for.

To turn it on (one time only):

1. On GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to "Deploy from a branch",
   pick the `main` branch and the `/ (root)` folder, then click **Save**.
3. After a minute or two, the page will be live at:
   `https://alibazzi2310.github.io/aliheartsrawan/`

Every push to `main` automatically republishes the page — still free.

## How the site is put together

```
index.html               the keepsake box — the shelf of letters
letters/your-name.html   Letter No. I — "Your Name"
letters/no-2.html        Letter No. II — the bouquet: poem, photo and vlog
letters/no-3.html        Letter No. III — "My Favourite Puzzle": three photo
                         puzzles that unlock a poem
letters/no-4.html        Letter No. IV — "Our Dreams": a night sky of
                         constellations that unlock a poem
letters/no-5.html        Letter No. V — "Wider Than the Sea": three months,
                         in Lebanese Arabic, read aloud by Ali
assets/puzzle.js         the puzzle game, loaded only by Letter No. III
assets/sky.js            the constellations, loaded only by Letter No. IV
assets/sea.js            the voice player, loaded only by Letter No. V
assets/audio/            recordings for letters that are read aloud
assets/styles.css        all styling, shared by every page
assets/app.js            all behaviour, shared by every page
manifest.webmanifest     lets her add the site to her phone's home screen
assets/icon-*.png        the home-screen icons
```

## Adding the next letter

1. Copy `letters/your-name.html` to something like `letters/no-2-title.html`.
2. In the new file, change the `<title>`, the `Letter No.` line, the `<h1>`,
   and the stanzas inside `<article class="letter">`. Keep the `write` class on
   each stanza — that's what makes the handwriting effect run.
3. In `index.html`, copy the existing `<a class="letter-card">` block inside
   `<div class="shelf">`, point its `href` at the new file, and update the
   number, title, and date.

That's it — styling and animations come along automatically.

## Giving a letter its own theme

A letter can change the drifting shapes with one attribute on `<body>`:

```html
<body class="locked" data-ambient="petals">
```

Leave it off for the default hearts; `petals` gives falling petals instead,
and the finger-trail follows suit. Letter No. II uses it, along with three
other flower pieces that any letter can reuse:

- `<svg class="vine">` — a stem that draws itself when scrolled to, used in
  place of the `✿ ✿ ✿` divider.
- `<section class="stems-card">` — the flowers and what each one means, set
  like an index with dotted leaders.
- `<aside class="care-tag">` — a florist's care tag.

## The puzzle letter

`letters/no-3.html` is a game: three 3x3 boards made from photos in
`assets/photos/`, solved by tapping two pieces to swap them. Solve all three
and the sealed letter at the bottom opens. Progress is kept in the browser,
so she can close it and come back.

To change it: swap the files the `data-src` attributes point at, and rewrite
the `.puzzle-caption` under each board. The scramble reshuffles until at
least seven of the nine pieces are out of place, so a board is never dealt
half solved.

## The constellation letter

`letters/no-4.html` is the one dark page in the box. `body.night` redefines the
shared colour tokens, so the letter card, the pips and the sealed vault all
follow without any page-specific styling, and `data-ambient="stars"` swaps the
drifting hearts for a field of twinkling stars.

The constellations live at the top of `assets/sky.js`: each has a `name`, a
`dream`, `stars` as `[x, y]` percentages of the panel, and `edges` joining them
by index. Tapping two stars draws an edge if the pair belongs to that
constellation; drawing every edge lights it up and reveals its dream.

Note that `sky.js` builds its cards after `app.js` has already collected the
page's `.reveal` elements, so it runs its own observer to reveal them. Anything
else that creates `.reveal` elements at runtime needs to do the same.

## The sea letter

`letters/no-5.html` is written in Lebanese Arabic. Each line is a `.sea-line`
with three parts: the Arabic with its vowel marks (`.ar`), how it sounds
(`.tr`) and what it means (`.en`). The Arabic reveals as a whole line rather
than through the handwriting effect, because splitting Arabic into single
letters breaks the joins between them.

The recording is `assets/audio/no-5.m4a` — a Voice Memo from an iPhone can go
in as it is. Until that file exists, the player says the voice is on its way.

To make the lines light up as he reads, give each `.sea-line` a
`data-at="seconds"` for when that line starts in the recording, for example
`data-at="12.5"`. Once lines have times, tapping one also jumps the recording
to it.

`body.sea` redefines the shared colour tokens the same way `body.night` does,
and it shares the twinkling stars of Letter No. IV.

## Adding a photo or a video to a letter

`letters/no-2.html` has both, filled in. Each is a `<figure class="media …">`
with the real content inside its `.media-inner`. An empty one carries the
extra class `is-placeholder`, which draws the dashed frame; delete that class
once the real thing is in. The markup to paste sits in a comment above each
block.

- **Photos** go in `assets/photos/`. They're framed like a polaroid with a
  handwritten caption underneath.
- **Video** can either live in `assets/video/` in this repo, or be embedded
  from YouTube or Vimeo. Keep a repo-hosted file under about 50MB — GitHub
  refuses files over 100MB, and a large video makes the page slow to load on
  a phone. Compressing to 720p is usually plenty.

## What's on the page

- A **sealed envelope** she taps to open each letter.
- A **handwriting effect** — the poem inks itself in as she scrolls.
- A **time-aware greeting** on the box ("Good morning, Rawan" / "Goodnight,
  Rawan", depending on when she visits).
- A **trail of hearts** that follows her finger or cursor.
- **Add to home screen** support, so the site can live on her phone like an app.
- Floating hearts, pastel gradients, and smooth scrolling throughout.

Anyone who prefers reduced motion (a phone accessibility setting) gets a calm,
still version automatically.
