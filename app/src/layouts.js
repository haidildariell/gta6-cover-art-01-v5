// Golden Hour Cover Lab — cover layouts.
// A layout is a list of photo panels (fractions of the cover) plus the
// title block. Panel coordinates are fractions of the cover width/height
// so the same layout renders at 1080x1080, 1080x1350 and 1920x1080.
// `photo` is the default sample-photo slot, `zoom`/`ox`/`oy` the default
// crop so the same photo reads differently in every panel.

export const LAYOUTS = [
  {
    id: 'nine',
    name: 'Photo Cover',
    blurb: '9-panel photo grid with title block',
    title: { x: 0, y: 0.78, w: 1, h: 0.22 },
    panels: [
      { x: 0.0, y: 0.0, w: 0.34, h: 0.26, photo: 0, zoom: 1.15, ox: 0.02, oy: -0.04 },
      { x: 0.34, y: 0.0, w: 0.33, h: 0.26, photo: 1, zoom: 1.25, ox: -0.06, oy: -0.02 },
      { x: 0.67, y: 0.0, w: 0.33, h: 0.26, photo: 2, zoom: 1.2, ox: 0.05, oy: 0.0 },
      { x: 0.0, y: 0.26, w: 0.34, h: 0.26, photo: 2, zoom: 1.35, ox: -0.08, oy: 0.03 },
      { x: 0.34, y: 0.26, w: 0.33, h: 0.26, photo: 0, zoom: 1.45, ox: 0.08, oy: 0.02 },
      { x: 0.67, y: 0.26, w: 0.33, h: 0.26, photo: 3, zoom: 1.2, ox: 0.0, oy: -0.05 },
      { x: 0.0, y: 0.52, w: 0.34, h: 0.26, photo: 3, zoom: 1.3, ox: -0.04, oy: 0.04 },
      { x: 0.34, y: 0.52, w: 0.33, h: 0.26, photo: 1, zoom: 1.4, ox: 0.06, oy: 0.0 },
      { x: 0.67, y: 0.52, w: 0.33, h: 0.26, photo: 0, zoom: 1.3, ox: -0.1, oy: -0.03 },
    ],
  },
  {
    id: 'hero',
    name: 'Hero Photo',
    blurb: 'One hero panel + three stacked panels',
    title: { x: 0, y: 0.8, w: 1, h: 0.2 },
    panels: [
      { x: 0.0, y: 0.0, w: 0.62, h: 0.8, photo: 0, zoom: 1.1, ox: 0.0, oy: 0.0 },
      { x: 0.62, y: 0.0, w: 0.38, h: 0.267, photo: 1, zoom: 1.25, ox: 0.0, oy: -0.03 },
      { x: 0.62, y: 0.267, w: 0.38, h: 0.267, photo: 2, zoom: 1.3, ox: 0.04, oy: 0.0 },
      { x: 0.62, y: 0.534, w: 0.38, h: 0.266, photo: 3, zoom: 1.25, ox: -0.03, oy: 0.02 },
    ],
  },
  {
    id: 'full',
    name: 'Full Bleed',
    blurb: 'One photo edge to edge, title overlaid',
    title: { x: 0, y: 0.72, w: 1, h: 0.28, overlay: true },
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 1.0, photo: 0, zoom: 1.05, ox: 0.0, oy: 0.0 },
    ],
  },
  {
    id: 'snaps',
    name: 'Tilted Snapshots',
    blurb: 'Three tilted snapshots on a sunset sky',
    title: { x: 0, y: 0.0, w: 1, h: 0.24 },
    panels: [
      { x: 0.06, y: 0.3, w: 0.4, h: 0.52, rot: -0.07, photo: 0, zoom: 1.2, ox: 0.0, oy: 0.0 },
      { x: 0.32, y: 0.36, w: 0.4, h: 0.52, rot: 0.05, photo: 2, zoom: 1.25, ox: 0.03, oy: 0.0 },
      { x: 0.58, y: 0.3, w: 0.4, h: 0.52, rot: -0.03, photo: 3, zoom: 1.2, ox: -0.02, oy: 0.02 },
    ],
  },
  {
    id: 'four',
    name: 'Four Panel',
    blurb: '2 x 2 photo grid with title block',
    title: { x: 0, y: 0.78, w: 1, h: 0.22 },
    panels: [
      { x: 0.0, y: 0.0, w: 0.5, h: 0.39, photo: 0, zoom: 1.15, ox: 0.0, oy: -0.03 },
      { x: 0.5, y: 0.0, w: 0.5, h: 0.39, photo: 1, zoom: 1.2, ox: -0.04, oy: 0.0 },
      { x: 0.0, y: 0.39, w: 0.5, h: 0.39, photo: 2, zoom: 1.25, ox: 0.05, oy: 0.02 },
      { x: 0.5, y: 0.39, w: 0.5, h: 0.39, photo: 3, zoom: 1.2, ox: 0.0, oy: -0.04 },
    ],
  },
  {
    id: 'split',
    name: 'Two Panel Split',
    blurb: 'Two tall panels side by side',
    title: { x: 0, y: 0.76, w: 1, h: 0.24 },
    panels: [
      { x: 0.0, y: 0.0, w: 0.5, h: 0.76, photo: 0, zoom: 1.2, ox: 0.06, oy: 0.0 },
      { x: 0.5, y: 0.0, w: 0.5, h: 0.76, photo: 2, zoom: 1.2, ox: -0.05, oy: 0.0 },
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

// Default per-panel crop state for a layout: one entry per panel, in order.
export function defaultPanelState(layout) {
  return layout.panels.map((p) => ({
    photo: p.photo,
    zoom: p.zoom,
    ox: p.ox,
    oy: p.oy,
  }));
}
