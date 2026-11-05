# Jolie Wren Stories V0.4 — first cloud publishing test

Upload the **contents** of this ZIP to the GitHub repository root, keeping `stories/` intact. **Do not overwrite your existing `stories/catalog.json` or any existing story JSON files** with the older samples included in this package. The files to update are `index.html`, `script.js`, `studio.html`, `studio.js` (unchanged), `studio.css`, and the new `studio-cloud.js` and `supabase-config.js`. `style.css` is unchanged.

Visit https://joliewrenstories.com/studio.html and sign in using the author login you created in Supabase Authentication (NOT your Supabase dashboard login). Create a NEW TEST story with a unique slug, add manuscript text, then click **Save private draft**. Check Supabase Table Editor: one story row and its episode rows should appear with `draft` status. The public catalog should NOT show the draft.

Next click **Publish free story now** (only for non-sensitive sample text). Confirm. Reload the homepage. The test story should appear, and opening it should load the published episode from Supabase. Existing static catalog stories continue working.

**Limitations:** This first pass cannot reload/edit a previously saved cloud draft in the Studio, and it does not support scheduled publishing, real polls, premium access, or cloud analytics. Saving the same slug updates that story; do not use the same slug for a different story. Save draft on a previously published slug unpublishes it. Episode numbering is positional. The editor retains a local copy; keep your Google Docs manuscript. Do not rely on this prototype for final publication or production backups. All DB writes require an authenticated author with RLS permissions. Never put a secret key in frontend files.

**Caution:** The bundled original sample `stories/` files are included only for a fresh install. Keep your LIVE versions, especially your corrected catalog and test story files.
