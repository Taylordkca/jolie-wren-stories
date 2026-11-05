# Jolie Wren Stories V0.8 — Polls, formatting and squirts

## IMPORTANT: Database migration first

Run `V08-DATABASE-MIGRATION.sql` once in Supabase SQL Editor. It adds a nullable `poll_data` JSONB column and retains existing data. Do not upload this SQL file to the public GitHub repository.

## Upload to GitHub repository root

Replace `studio.html`, `studio.js`, `studio-cloud.js`, `script.js`. Keep `stories/`, `supabase-config.js`, and other files unchanged.

## Tests

1. Sign in, open a draft, add a poll, author fallback and a scheduled release time. Save draft. Reopen it on a different device. Confirm all fields survived.
2. Paste formatted bold/italic text from Google Docs; the editor stores safe `**bold**` and `*italic*` markers, which render formatted in preview and public reader. Word import uses the same markers. The manuscript editor is still a textarea, not a full WYSIWYG editor.
3. Publish a disposable FREE test story with a poll. Polls are still browser-local demonstration voting, not real server-counted voting.
4. Press Squirt 4 times: label stops at x3 and only 3 increments count. Refresh browser page: per-episode x counter resets, cumulative local total remains. Likes remain persistent.

## Limits / safeguards

Scheduling dates are saved as Eastern timestamps but do NOT auto-publish. Publishing still publishes ALL nonempty episodes at once. Do not publish a story with unfinished/future episodes. No premium publishing. Do not upload secret keys. The new `poll_data` column contains author fallback; public select currently exposes it, so it is NOT a secure private branching mechanism. Implement protected poll tables and server-side voting before launch.

This release uses lightweight Markdown markers for bold/italics; rich HTML is never stored or rendered directly. Some complex Google Docs formatting may not transfer perfectly.
