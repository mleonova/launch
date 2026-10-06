# Launch Aesthetics

A static marketing site for Launch Aesthetics — aesthetic laser rentals and practice-growth services. Built with plain HTML, CSS and JavaScript, no build step or framework required.

## What's included

- `index.html` — full one-page site (nav, hero, how it works, devices, rent vs. buy, services, partnerships, about, FAQ, contact)
- `css/styles.css` — all styling
- `js/main.js` — mobile nav toggle, treatment-category modal, contact form validation + submission
- `images/` — placeholder photography (see below)
- `scripts/gen_images.py` — the script used to generate the placeholder images (optional, not needed to run the site)

## Running it locally

No build tools needed. Either:

- Open `index.html` directly in a browser, or
- Serve the folder so relative paths behave exactly like they will on GitHub Pages:

  ```bash
  python3 -m http.server 8000
  # then visit http://localhost:8000
  ```

## Deploying with GitHub Pages

1. Create a new GitHub repository and push this folder to it:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Launch Aesthetics site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. In the repo on GitHub: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. Save. GitHub gives you a URL like `https://<your-username>.github.io/<your-repo>/` within a minute or two.

## Connecting the contact form (Formspree)

The "Send inquiry" form at the bottom of the page is wired for [Formspree](https://formspree.io), a free service that emails you form submissions with no backend code.

1. Create a free account at formspree.io and add a new form.
2. Copy the form endpoint it gives you — it looks like `https://formspree.io/f/abcd1234`.
3. In `index.html`, find the form tag:

   ```html
   <form id="inquiry-form" class="inquiry-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" novalidate>
   ```

4. Replace `YOUR_FORM_ID` with the ID Formspree gave you.
5. Commit and push. Submissions will now email you directly.

Until you do this, the form still validates and submits — it just shows a "demo mode" success message locally instead of sending anywhere, so nothing looks broken while you're setting Formspree up.

The form includes a honeypot field (`_gotcha`) and basic client-side validation (name, valid email, message required) before it will submit.

## Photos

Photography is loaded from Unsplash's image CDN (free to use under the [Unsplash License](https://unsplash.com/license)), served responsively with `srcset` so phones download smaller files. Each `<img>` has a `data-fallback` pointing at a local file in `images/`; if the remote photo can't load, the page swaps in the local placeholder automatically.

To use your own photos, replace the `src`/`srcset` on the relevant `<img>` in `index.html` with your file (e.g. `images/my-photo.jpg`) and remove the `srcset` attribute.

Credits (Unsplash photographers): Farhad Ibrahimzade, Mélyna Côté, Omar Lopez, Look Studio, Studio Michael França, Caroline Badran, Patient Perfect, Sam Badmaeva, Reece van der Merwe, P Shakoori, Sam Moghadam, Laura Jaeger, Huha Inc., Centre for Ageing Better, Christina @ wocintechchat.com, Pawel Czerwinski.

Original pre-redesign files are kept in `_backup/`.

## Interactive elements

- Sticky header that turns frosted on scroll, a scroll-progress bar, active-section highlighting and a back-to-top button.
- Full-screen mobile menu (below 860px).
- Scroll-reveal animations, count-up stats, an infinite brand/treatment marquee and a light parallax on the hero photo.
- "How it works" tabs (click, arrow keys, or gentle autoplay until the visitor interacts).
- Device grid filter by brand, and a category modal with description, typical treatments and platforms. "Request a quote" in the modal pre-fills the contact form.
- FAQ accordion.
- Contact form with interest chips, inline validation and Formspree submission (see above).
- All motion respects the visitor's "reduce motion" setting.

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). No polyfills included; the CSS uses `clamp()`, `aspect-ratio` and CSS Grid, which are supported in all browsers released in the last several years.
