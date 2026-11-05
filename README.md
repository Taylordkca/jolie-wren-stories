# Jolie Wren Stories — Reader Prototype 0.1

Static, mobile-first prototype for GitHub Pages. No build tools needed.

## Install
Upload `index.html`, `style.css`, `script.js`, and the `stories` folder to the **root** of your `jolie-wren-stories` repository. Keep the `sample.json` file inside `stories/`.

Open https://taylordkca.github.io/jolie-wren-stories/ after GitHub Pages deploys.

## Edit the sample story
Open `stories/sample.json` in GitHub and click the pencil icon. Change the title, description, episode titles, and text. Each episode contains `blocks` of type `text`, `chapter`, or `spicy`. For spicy blocks, provide `text` and `recap`. Maintain valid JSON punctuation (double quotes, commas). For line breaks inside a JSON string, use `\\n`.

To add an episode, copy one episode object within the `episodes` array and give it a unique `id`. The homepage, episode navigation, and table of contents update automatically. This first prototype loads **one** story (`stories/sample.json`); multi-story library support comes next.

## Important limitations
- Votes are stored in each visitor's browser only; they are **not** aggregated across visitors, verified, or scheduled. No public vote results are shown. A backend is required for shared polls, closing times, and secure eligibility.
- Reading position is approximate and stored in localStorage for this browser/device only. Switching reading modes attempts to preserve the nearest story block.
- Spicy scenes in this sample are non-explicit placeholders. The skip toggle replaces marked scenes with their recaps.
- The site is public; don't commit credentials or unpublished premium fiction.
