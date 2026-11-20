// Golden Hour Cover Lab — cover renderer.
// Draws the whole poster on a 2D canvas: graded photo panels, halftone
// dots, sunset title block with a giant gradient title, neon script
// subtitle, starburst badge, tagline strip, grain and vignette.
// Everything is drawn with canvas calls; nothing is a CSS filter.

import { gradeById, duotoneRamp } from './grades.js';
import { layoutById } from './layouts.js';

let noiseTile = null;

function makeNoiseTile() {
  const tile = document.createElement('canvas');
  tile.width = 180;
  tile.height = 180;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(180, 180);
  let seed = 1234567;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(next() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  return tile;
}

function coverFitDraw(tctx, img, pw, ph, zoom, ox, oy) {
  const scale = Math.max(pw / img.width, ph / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (pw - dw) / 2 + ox * pw;
  const dy = (ph - dh) / 2 + oy * ph;
  tctx.drawImage(img, dx, dy, dw, dh);
}

function applyGradePixels(tctx, pw, ph, grade) {
  const img = tctx.getImageData(0, 0, pw, ph);
  const d = img.data;
  const c = grade.contrast;
  const sat = grade.saturation;
  for (let i = 0; i < d.length; i += 4) {
    let r = (d[i] - 128) * c + 128;
    let g = (d[i + 1] - 128) * c + 128;
    let b = (d[i + 2] - 128) * c + 128;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const gr = lum + (r - lum) * sat;
    const gg = lum + (g - lum) * sat;
    const gb = lum + (b - lum) * sat;
    const t = Math.max(0, Math.min(1, lum / 255));
    const ramp = duotoneRamp(grade, t);
    d[i] = gr * 0.3 + ramp[0] * 0.7;
    d[i + 1] = gg * 0.3 + ramp[1] * 0.7;
    d[i + 2] = gb * 0.3 + ramp[2] * 0.7;
  }
  tctx.putImageData(img, 0, 0);
  if (grade.tintAlpha > 0) {
    tctx.globalAlpha = grade.tintAlpha;
    tctx.fillStyle = grade.tint;
    tctx.fillRect(0, 0, pw, ph);
    tctx.globalAlpha = 1;
  }
  return img;
}

function drawHalftoneDots(tctx, pw, ph, imgData) {
  const step = Math.max(9, Math.round(pw / 110));
  const d = imgData.data;
  tctx.fillStyle = 'rgba(12,4,24,0.55)';
  for (let y = step / 2; y < ph; y += step) {
    for (let x = step / 2; x < pw; x += step) {
      const ix = (Math.floor(y) * pw + Math.floor(x)) * 4;
      const lum = 0.2126 * d[ix] + 0.7152 * d[ix + 1] + 0.0722 * d[ix + 2];
      if (lum < 210) {
        const r = (1 - lum / 255) * step * 0.42;
        if (r > 0.7) {
          tctx.beginPath();
          tctx.arc(x, y, r, 0, Math.PI * 2);
          tctx.fill();
        }
      }
    }
  }
}

function drawGradedPanel(ctx, panel, pw, ph, img, grade) {
  const temp = document.createElement('canvas');
  temp.width = Math.max(2, Math.round(pw));
  temp.height = Math.max(2, Math.round(ph));
  const tctx = temp.getContext('2d');
  coverFitDraw(tctx, img, temp.width, temp.height, panel.zoom, panel.ox, panel.oy);
  const pixels = applyGradePixels(tctx, temp.width, temp.height, grade);
  if (grade.halftone) drawHalftoneDots(tctx, temp.width, temp.height, pixels);
  return temp;
}

function drawPalmSilhouette(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, s * 0.045);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.22, y - s * 0.95);
  ctx.stroke();
  const topX = x + s * 0.22;
  const topY = y - s * 0.95;
  ctx.lineWidth = Math.max(1.5, s * 0.03);
  const fronds = [-2.5, -1.8, -1.1, -0.4, 0.4, 1.2, 2.1];
  for (const a of fronds) {
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * s * 0.3,
      topY - s * 0.16,
      topX + Math.cos(a) * s * 0.58,
      topY + Math.abs(Math.sin(a)) * s * 0.3 + s * 0.1,
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(topX, topY, s * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStarburstBadge(ctx, cx, cy, r, lines) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.78;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd23e';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#1c0b2e';
  ctx.stroke();
  ctx.fillStyle = '#1c0b2e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const size = r * 0.34;
  ctx.font = `${size}px Anton, sans-serif`;
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * size * 1.15);
  });
  ctx.restore();
}

function fitFont(ctx, text, maxWidth, startSize, family) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

function drawTitleBlock(ctx, W, H, zone, state, grade) {
  const zx = zone.x * W;
  const zy = zone.y * H;
  const zw = zone.w * W;
  const zh = zone.h * H;
  if (!zone.overlay) {
    const bg = ctx.createLinearGradient(0, zy, 0, zy + zh);
    bg.addColorStop(0, '#ff8a2a');
    bg.addColorStop(0.45, '#ff3d7e');
    bg.addColorStop(1, '#5b1a8a');
    ctx.fillStyle = bg;
    ctx.fillRect(zx, zy, zw, zh);
  } else {
    const scrim = ctx.createLinearGradient(0, zy - zh * 0.4, 0, zy + zh);
    scrim.addColorStop(0, 'rgba(20,4,32,0)');
    scrim.addColorStop(1, 'rgba(20,4,32,0.82)');
    ctx.fillStyle = scrim;
    ctx.fillRect(zx, zy - zh * 0.4, zw, zh * 1.4);
  }
  const palmColor = zone.overlay ? 'rgba(12,4,24,0.55)' : 'rgba(28,8,44,0.5)';
  drawPalmSilhouette(ctx, zx + zw * 0.05, zy + zh * 0.98, zh * 0.7, palmColor);
  drawPalmSilhouette(ctx, zx + zw * 0.95, zy + zh * 0.98, zh * 0.58, palmColor);

  const cx = zx + zw / 2;
  const eyebrowY = zy + zh * 0.13;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  const ebSize = Math.max(10, zh * 0.085);
  ctx.font = `bold ${ebSize}px Arial, sans-serif`;
  ctx.fillText('W E L C O M E   T O', cx, eyebrowY);

  const title = (state.title || 'PALM HEAT').toUpperCase();
  const titleSize = fitFont(ctx, title, zw * 0.92, zh * 0.42, 'Anton, sans-serif');
  const titleY = zy + zh * 0.47;
  const grad = ctx.createLinearGradient(0, titleY - titleSize * 0.55, 0, titleY + titleSize * 0.55);
  grad.addColorStop(0, '#ffe95c');
  grad.addColorStop(0.5, '#ff9a2a');
  grad.addColorStop(1, '#ff2f92');
  ctx.font = `${titleSize}px Anton, sans-serif`;
  ctx.lineWidth = Math.max(2, titleSize / 16);
  ctx.strokeStyle = '#1c0b2e';
  ctx.lineJoin = 'round';
  ctx.strokeText(title, cx, titleY);
  ctx.fillStyle = grad;
  ctx.fillText(title, cx, titleY);

  const sub = state.subtitle || 'golden hour heat';
  const subSize = fitFont(ctx, sub, zw * 0.7, zh * 0.22, 'Pacifico, cursive');
  ctx.font = `${subSize}px Pacifico, cursive`;
  ctx.shadowColor = '#ff2fb3';
  ctx.shadowBlur = subSize * 0.6;
  ctx.fillStyle = '#ffd7f2';
  ctx.fillText(sub, cx, zy + zh * 0.77);
  ctx.shadowBlur = 0;

  const badgeR = Math.min(zw, zh) * 0.42;
  drawStarburstBadge(ctx, zx + zw * 0.9, zy + zh * 0.42, badgeR, ['SUMMER', '2026']);
}

function drawTaglineStrip(ctx, W, H, tagline) {
  const stripH = Math.max(18, H * 0.032);
  const y = H - stripH;
  ctx.fillStyle = '#14041f';
  ctx.fillRect(0, y, W, stripH);
  ctx.fillStyle = '#ffd23e';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const size = stripH * 0.52;
  ctx.font = `bold ${size}px Arial, sans-serif`;
  const unit = ` ${tagline}  •  PALM HEAT  •  GOLDEN HOUR  •  `;
  let text = unit;
  while (ctx.measureText(text).width < W + 200) text += unit;
  ctx.fillText(text, 0, y + stripH / 2);
}

function drawGrainAndVignette(ctx, W, H, grade) {
  if (!noiseTile) noiseTile = makeNoiseTile();
  if (grade.grain > 0) {
    const pattern = ctx.createPattern(noiseTile, 'repeat');
    ctx.save();
    ctx.globalAlpha = grade.grain;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (grade.vignette > 0) {
    const vg = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.42,
      W / 2, H / 2, Math.max(W, H) * 0.75,
    );
    vg.addColorStop(0, 'rgba(10,2,20,0)');
    vg.addColorStop(1, `rgba(10,2,20,${grade.vignette})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }
}

export function renderCoverToCanvas(width, height, state, photos) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  renderCover(ctx, width, height, state, photos);
  return canvas;
}

export function renderCover(ctx, W, H, state, photos) {
  const grade = gradeById(state.gradeId);
  const layout = layoutById(state.layoutId);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#ff9a3d');
  sky.addColorStop(0.5, '#ff4d7e');
  sky.addColorStop(1, '#4a1a7a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  layout.panels.forEach((panel, i) => {
    const slot = state.panels && state.panels[i] ? state.panels[i] : panel;
    const img = photos[slot.photo];
    const px = panel.x * W;
    const py = panel.y * H;
    const pw = panel.w * W;
    const ph = panel.h * H;
    if (!img) {
      ctx.fillStyle = '#2a1140';
      ctx.fillRect(px, py, pw, ph);
      return;
    }
    const graded = drawGradedPanel(ctx, slot, pw, ph, img, grade);
    ctx.save();
    if (panel.rot) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate(panel.rot);
      ctx.translate(-pw / 2, -ph / 2);
      ctx.drawImage(graded, 0, 0);
    } else {
      ctx.drawImage(graded, px, py);
    }
    ctx.restore();
    ctx.save();
    if (panel.rot) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate(panel.rot);
      ctx.translate(-pw / 2, -ph / 2);
    } else {
      ctx.translate(px, py);
    }
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(0, 0, pw, ph);
    ctx.restore();
  });

  drawTitleBlock(ctx, W, H, layout.title, state, grade);
  drawTaglineStrip(ctx, W, H, state.tagline || 'NEW SUMMER 2026');
  drawGrainAndVignette(ctx, W, H, grade);
}
