# V0.6 — Manuscript paragraphs and cloud library controls

Upload these changed files to the GitHub repository root: `studio.html`, `studio.js`, `studio-cloud.js`, `studio.css`, `script.js`. Leave `stories/` and `supabase-config.js` unchanged. No database migration is required.

Changes: Each pasted line/paragraph is now stored as a separate paragraph block, rather than joining adjacent lines. Existing saved cloud stories will be displayed with paragraph breaks after you reopen and re-save them: previously merged blocks cannot be reconstructed automatically. Spicy scenes now render paragraphs separately. Private draft saves allow empty episode manuscripts; publishing still requires text in every episode. The cloud story list supports title search, draft/published filtering and sorting. No public dates have been added.

Not included yet: rich-text preservation from Google Docs (bold/italics), per-episode scheduled publishing, individual episode publish status, cloud persistence of scheduling metadata, and backend poll countdown. Do not treat the scheduled release input as live scheduling.

IMPORTANT: V0.6 still publishes every episode of a story at once. Use disposable test content. Keep original Google Docs manuscripts and a JSON backup.
