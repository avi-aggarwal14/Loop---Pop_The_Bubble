# Product Photos

This folder is for the older broad catalogue/product-card grid.

The current Red Bull demo video uses `public/demo-assets/` instead:

```text
public/demo-assets/red-bull-coconut-berry.webp
public/demo-assets/red-bull-memory-alt.avif
public/demo-assets/red-bull-summer-edition.jpg
public/demo-assets/red-bull-lineup.jpg
```

Use this `public/products/` folder only when rebuilding the broader Nike /
Honi Poke / Red Bull catalogue grid. Product images placed here are served at
`/products/<name>`.

Preferred format:

- `.png` for transparent product cutouts
- `.webp` or `.jpg` is fine if the code is updated to reference that extension

Shape tips:

- Nike cards are wide.
- Honi Poke cards are square.
- Red Bull cards are tall and narrow, rendered with `contain` so full cans do
  not get cropped.

Expected catalogue filenames:

| Brand | Product | Filename |
|---|---|---|
| Nike | Phantom 6 Elite | `nike-phantom-6-elite.png` |
| Nike | Jordan 1 Low | `nike-jordan-1-low.png` |
| Nike | Jordan 1 | `nike-jordan-1.png` |
| Nike | Free Ride | `nike-free-ride.png` |
| Honi Poke | Spicy Prawn | `honi-spicy-prawn.png` |
| Honi Poke | Ahi Tuna | `honi-ahi-tuna.png` |
| Honi Poke | Honi Salmon | `honi-salmon.png` |
| Honi Poke | California | `honi-california.png` |
| Red Bull | Coconut Berry | `redbull-coconut-berry.png` |
| Red Bull | Zero | `redbull-zero.png` |
| Red Bull | Tropical Edition | `redbull-tropical-edition.png` |
| Red Bull | Summer Edition | `redbull-summer-edition.png` |
