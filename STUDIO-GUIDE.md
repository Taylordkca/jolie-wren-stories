# Jolie Wren Publishing Studio — v0.3

Open `studio.html` on the deployed website to use the publishing studio. This is an **unauthenticated prototype**, not a private admin page: the page itself is public. Drafts are saved only in your browser's localStorage. Do not rely on it as the sole copy of an unpublished manuscript; keep your source Google Doc.

## Import

- **Paste:** Copy a single episode from a Google Docs tab and paste it into the manuscript field.
- **DOCX:** In Google Docs, download a Microsoft Word `.docx` export. Choose one or multiple files; each file becomes an episode. Google Docs tab exports are not guaranteed to split into individual episodes: export tabs separately when necessary. The browser imports plain text, not inline formatting.
- The DOCX converter uses Mammoth from a CDN, so it requires an internet connection.

## Manuscript markers

Put markers on their own lines:

```
[CHAPTER: Chapter One]

Normal story text.

[SPICY START: Optional Scene Title]
Explicit scene text.
[SPICY RECAP]
Short, non-explicit replacement recap.
[SPICY END]
```

Use a blank line between paragraphs. Every spicy section needs its recap and end marker. Chapter markers create traditional chapter headings in Continuous Mode.

## Polls and scheduling

Enter a poll question, two or more options (one per line), and select an author fallback option. Poll dates and publication dates are stored as **metadata only**. The current GitHub Pages reader does not enforce scheduled publishing, secure votes, or automatic branches. These need a private backend.

## Export and publish

1. Download the **story JSON** and **catalog entry** from Studio.
2. For a new story, upload `story-id.json` to the `stories/` folder in GitHub.
3. Open `stories/catalog.json` and add the catalog entry as another object in its existing `stories` array. **Do not overwrite the entire catalog** with the single downloaded entry.
4. For an existing story, merge new episodes into the existing story JSON. The Studio's downloaded story JSON includes only the episodes in the current local draft, so replacing an existing published file can erase earlier episodes.
5. GitHub Pages will deploy the public content after you commit. Do not upload unpublished or premium manuscript files to this public repository.

## Current limitations

- Drafts are browser-local, not synced between phone and computer.
- Rich text formatting (italics, bold) is not preserved from `.docx`.
- Multi-tab Google Docs are not parsed into episodes automatically.
- No authentication, private storage, real scheduling, or backend voting.
- Catalog entries are generated separately and require a manual merge.

These are intentional V0.3 limits; the next milestone should simplify publishing and protect unpublished work.
