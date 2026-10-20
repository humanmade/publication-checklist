# README media

The screenshots in `docs/images/` come from WordPress Playground with the demo checks in this folder. To regenerate them:

1. Build the plugin (`npm ci`, `npm run build`), then copy it without `node_modules`, `.git` and `docs` into `<work>/publication-checklist`. Copy `demo-checks.php` and `demo-checks.js` into `<work>/mu-plugins` and `blueprint.json` into `<work>`.
2. From `<work>`, run `npx @wp-playground/cli server --blueprint=blueprint.json --php=8.3 --wp=latest --port=9536 --mount=./publication-checklist:/wordpress/wp-content/plugins/publication-checklist --mount=./mu-plugins:/wordpress/wp-content/mu-plugins`.
3. Run `BASE=http://127.0.0.1:9536 VIDEO=<work>/video node docs/media/capture.js`. It writes the PNGs to `docs/images/` and a `.webm` recording to `VIDEO`.
4. Convert the recording to `docs/images/live-checks.gif` with ffmpeg: 12 fps, 960px wide, using `palettegen` and `paletteuse`.
