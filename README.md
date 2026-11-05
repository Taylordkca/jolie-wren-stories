# Jolie Wren Stories — v0.2

Static, mobile-first reader prototype for GitHub Pages. No build step.

## Deploy

Upload the **contents** of this ZIP to the root of your GitHub repository, keeping the `stories/` folder intact. Replace `index.html`, `style.css`, and `script.js` from v0.1. Open your GitHub Pages URL after deployment.

## Add a story

1. Copy `stories/moonlight.json` to `stories/my-new-story.json`.
2. Change its unique `id`, title, description, tags, warnings and episodes. Each episode has its own `id`, title, blocks, optional poll, notes, and spice.
3. Add an entry to `stories/catalog.json` with the **same id** and `file` set to `stories/my-new-story.json`. The catalog entry also has type (`series` or `short`), typical spice (0–5), tags, description, release, access, date and optional views/likes.
4. Commit both files. Your new story appears automatically. There is no need to edit HTML or JavaScript.

**Note:** This is a public GitHub Pages prototype. Do not upload premium or unpublished manuscripts, credentials, or sensitive data. The catalog `access` field is descriptive only; it does not enforce access control.

## What works

- Multiple stories and per-story reading progress; episode and continuous reading
- Search by title, description, tags; multi-select All Tags page with ALL/ANY match
- Sort by date, A–Z, typical spice, views, likes (last two use placeholder catalog values)
- Reading list: Want to Read, Reading, Finished (saved in this browser)
- Local likes, separate from local anonymous splash counter (not site-wide)
- Spice guide and existing reader settings, skip scenes, sample local polls

## Not connected yet

Real shared vote totals, public likes/views, site-wide splash count, authentication, paid access, Google Docs importer, and automatic scheduled publishing all require additional infrastructure. The prototype poll remains browser-local.

## Google Docs authoring

For now, prepare one episode per tab and export/paste content into the JSON format. A mobile-friendly importer will come in a later milestone. The existing `chapter`, `text`, and `spicy` block formats are demonstrated in `stories/sample.json`.


## Publishing Studio V0.3

Open `studio.html` to paste or import episodes and export compatible JSON. Read `STUDIO-GUIDE.md` before uploading. This is a prototype, not a secure author dashboard or automated publisher.
