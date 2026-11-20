// Golden Hour Cover Lab — colour grades.
// Every grade is a real canvas treatment: the renderer posterizes the
// photo pixels, maps them through a two-stop duotone ramp, and (for the
// Poster Ink grade) stamps a halftone dot screen over the result.
// No CSS filter is used for any of this; the math lives in render.js.

export const GRADES = [
  {
    id: 'sunset',
    name: 'Sunset',
    dark: [26, 8, 46],
    light: [255, 214, 130],
    mid: [255, 110, 80],
    tint: '#ff7a2f',
    tintAlpha: 0.10,
    contrast: 1.12,
    saturation: 1.15,
    halftone: true,
    grain: 0.05,
    vignette: 0.28,
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    dark: [8, 6, 34],
    light: [190, 240, 255],
    mid: [255, 92, 225],
    tint: '#ff2fb3',
    tintAlpha: 0.12,
    contrast: 1.18,
    saturation: 1.35,
    halftone: true,
    grain: 0.07,
    vignette: 0.34,
  },
  {
    id: 'teal',
    name: 'Teal Noir',
    dark: [4, 18, 22],
    light: [214, 244, 232],
    mid: [64, 190, 178],
    tint: '#0f766e',
    tintAlpha: 0.12,
    contrast: 1.22,
    saturation: 0.95,
    halftone: false,
    grain: 0.06,
    vignette: 0.42,
  },
  {
    id: 'rose',
    name: 'Rose Gold',
    dark: [46, 14, 26],
    light: [255, 226, 196],
    mid: [244, 130, 140],
    tint: '#f4a988',
    tintAlpha: 0.10,
    contrast: 1.08,
    saturation: 1.10,
    halftone: false,
    grain: 0.04,
    vignette: 0.24,
  },
  {
    id: 'mono',
    name: 'Mono Poster',
    dark: [10, 10, 12],
    light: [245, 245, 240],
    mid: [128, 128, 128],
    tint: '#ffffff',
    tintAlpha: 0.0,
    contrast: 1.30,
    saturation: 0.0,
    halftone: true,
    grain: 0.08,
    vignette: 0.30,
  },
  {
    id: 'ink',
    name: 'Poster Ink',
    dark: [16, 4, 40],
    light: [255, 200, 90],
    mid: [255, 90, 60],
    tint: '#ff5c1f',
    tintAlpha: 0.14,
    contrast: 1.28,
    saturation: 1.45,
    halftone: true,
    grain: 0.09,
    vignette: 0.36,
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

// Map a 0..1 luminance value through the grade's dark -> mid -> light ramp.
export function duotoneRamp(grade, t) {
  const mix = (a, b, k) => a + (b - a) * k;
  let r, g, b;
  if (t < 0.5) {
    const k = t / 0.5;
    r = mix(grade.dark[0], grade.mid[0], k);
    g = mix(grade.dark[1], grade.mid[1], k);
    b = mix(grade.dark[2], grade.mid[2], k);
  } else {
    const k = (t - 0.5) / 0.5;
    r = mix(grade.mid[0], grade.light[0], k);
    g = mix(grade.mid[1], grade.light[1], k);
    b = mix(grade.mid[2], grade.light[2], k);
  }
  return [r, g, b];
}
