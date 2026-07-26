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
