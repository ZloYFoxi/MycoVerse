# MycoVerse Visual Asset Pipeline

Alpha 0.35.0 introduces stable runtime paths so final generated artwork can replace placeholders without changing gameplay code.

## Runtime folders

- `assets/ui/backgrounds/` — one environmental background per game screen.
- `assets/themes/` — active planet backgrounds.
- `assets/miners/portraits/` — square miner portraits named exactly by miner ID.
- `assets/bosses/` — gate-boss artwork named by the boss registry.
- `assets/reference/` — approved concept sheets used only as visual direction.

## Replacement rules

1. Keep the existing filename and path.
2. Use SVG or optimized WebP/AVIF with a fallback when required.
3. Miner portraits should be square, with the face and cap inside the central safe area.
4. Screen backgrounds should be wide and preserve readable dark space behind interface panels.
5. Boss images should work inside a landscape arena crop.
6. Do not bake labels, buttons, health bars, or UI text into final artwork.

## Recommended source sizes

- Screen background: 1920×1080 master, 1280×720 mobile/medium derivative.
- Miner portrait: 1024×1024 master, 512×512 runtime derivative.
- Boss artwork: 1600×900 master, 1200×675 runtime derivative.
- Planet artwork: 1920×1080 master.

## Current status

The current portraits and screen backgrounds are production placeholders. They prove the complete loading and theme-switching pipeline. Final generated artwork can now be integrated one batch at a time.
