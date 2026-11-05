# Jolie Wren Stories V0.5 — Cloud Story Library (test build)

Upload the updated `studio.html`, `studio.css`, and `studio-cloud.js` to the root of your existing GitHub repository. Do not overwrite the `stories/` directory, `supabase-config.js`, or other working files.

Test: sign in at https://joliewrenstories.com/studio.html, click Refresh list, open the private test story, confirm the manuscript and metadata, make a small edit, click Save private draft, and reopen it.

**Limitations:** Cloud reload currently restores manuscript blocks, title, description, tags, spice, and notes, but NOT poll choices, author fallback, scheduled dates, or story-level warnings (not stored in V0.4 schema). Preserve Google Docs originals and JSON backups. Saving a published story as a private draft is blocked; use Publish to update a published story, which makes all editor episodes public. No delete/reorder sync: removing episodes from the editor does not remove old cloud episodes. Do not use real manuscripts yet.

This version uses your existing Supabase schema; no SQL migration required.
