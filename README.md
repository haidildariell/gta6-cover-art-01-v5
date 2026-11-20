# Golden Hour Cover Lab

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/haidildariell/gta6-cover-art-01-v5/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/haidildariell/gta6-cover-art-01-v5/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Bounty: https://make.fun/bounty/gta6-cover-art-01

Turn any photo into GTA-style multi-panel cover art, offline in your
browser. Upload photos, pick a layout, pick a sunset or neon grade,
write your title, and export a poster-sized PNG to share.

## What it does

- **6 layouts** — Photo Cover (9-panel grid, the default), Hero Photo,
  Full Bleed, Tilted Snapshots, Four Panel, Two Panel Split.
- **6 grades** — Sunset, Neon Nights, Teal Noir, Rose Gold, Mono Poster,
  Poster Ink. Each grade is a real canvas treatment: the photo pixels
  are posterized and mapped through a duotone ramp, and the halftone
  grades get a genuine dot screen drawn over the panels.
- **Any photo** — upload one or several photos from your machine; click
  any panel to select it, then change its photo, zoom and position.
  One photo can fill every panel with different crops, or every panel
  can hold a different photo.
- **Big lettering** — a giant gradient title in Anton, a neon script
  subtitle in Pacifico, a starburst "SUMMER 2026" badge, a tagline
  strip, palm silhouettes, grain and vignette.
- **One-click presets** — Photo Cover, Hero Photo, Neon Night.
- **Undo / redo** — full history, plus Ctrl+Z / Ctrl+Y.
- **Export** — 1080 x 1080, 1080 x 1350 and 1920 x 1080 PNG, one click each.

## How to run

Any static server works — the app makes zero network requests:

```
node serve.ts
```

then open http://localhost:8080 in desktop Chrome. Or serve `app/`
with any other static server and open `index.html`.

The cover on first load is already a finished poster: the four sample
photos fill a 9-panel grid with the Sunset grade and Poster Ink
halftone, titled PALM HEAT.

## Photo credits

Sample photos generated with an image model for this entry; no real
person depicted. Uploaded photos never leave your machine — they are
read locally and never sent anywhere.

## Notes

- Original art and lettering only: no game logo, artwork, character
  or font. The two shipped fonts (Anton, Pacifico) are under the SIL
  Open Font License 1.1 — see `app/fonts/FONTS.md`.
- `main.ts` hands the app in: it copies `app/` and `screenshots/`
  into the output directory and writes `dossier.json`. It never
  deletes the output directory.
