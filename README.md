# P.GÓRNE

A static HTML site for the P.GÓRNE atelier. Pages are `index.html`, `ethos.html`, `atelier.html`, `galerie.html`, `ready-made.html`, and `book.html`; there is no build step. `404.html` and `thank-you.html` provide the error and booking confirmation pages.

Vercel serves the site. `vercel.json` enables clean URLs and asset caching.

Adding images: resize to max 1600px on the long edge, JPEG quality ~80, and set width/height on the `<img>`.

The licensed AL Milano font file must be added to `assets/fonts/` for `book.html`.
