// Golden Hour Cover Lab — editor state and UI wiring.
// Loads the sample photos, keeps the cover state, renders the live
// preview, and exports PNGs in the three post sizes. In ?shot=cover mode
// the page draws one cover full-frame so a screenshot captures exactly
// what the app itself drew.

import { LAYOUTS, layoutById, defaultPanelState } from './layouts.js';
import { GRADES } from './grades.js';
import { renderCover, renderCoverToCanvas } from './render.js';

const SAMPLES = [
  { id: 'convertible', label: 'Convertible', src: 'samples/sample-convertible.jpg' },
  { id: 'rooftop', label: 'Rooftop', src: 'samples/sample-rooftop.jpg' },
  { id: 'neon', label: 'Neon street', src: 'samples/sample-neon.jpg' },
  { id: 'pier', label: 'Pier', src: 'samples/sample-pier.jpg' },
];

const EXPORT_SIZES = [
  { w: 1080, h: 1080, label: '1080 x 1080' },
  { w: 1080, h: 1350, label: '1080 x 1350' },
  { w: 1920, h: 1080, label: '1920 x 1080' },
];

const state = {
  layoutId: 'nine',
  gradeId: 'sunset',
  title: 'PALM HEAT',
  subtitle: 'golden hour heat',
  tagline: 'NEW SUMMER 2026',
  panels: defaultPanelState(layoutById('nine')),
  selectedPanel: 0,
};

const photos = [];
const undoStack = [];
const redoStack = [];
let previewCanvas = null;
let previewCtx = null;

function snapshotState() {
  return JSON.stringify({
    layoutId: state.layoutId,
    gradeId: state.gradeId,
    title: state.title,
    subtitle: state.subtitle,
    tagline: state.tagline,
    panels: state.panels,
  });
}

function pushUndo() {
  undoStack.push(snapshotState());
  if (undoStack.length > 40) undoStack.shift();
  redoStack.length = 0;
  refreshUndoButtons();
}

function restoreSnapshot(json) {
  const data = JSON.parse(json);
  state.layoutId = data.layoutId;
  state.gradeId = data.gradeId;
  state.title = data.title;
  state.subtitle = data.subtitle;
  state.tagline = data.tagline;
  state.panels = data.panels;
  syncControlsFromState();
}

function undoCover() {
  if (!undoStack.length) return;
  redoStack.push(snapshotState());
  restoreSnapshot(undoStack.pop());
  refreshUndoButtons();
  drawPreview();
}

function redoCover() {
  if (!redoStack.length) return;
  undoStack.push(snapshotState());
  restoreSnapshot(redoStack.pop());
  refreshUndoButtons();
  drawPreview();
}

function refreshUndoButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + src));
    img.src = src;
  });
}

async function loadSamplePhotos() {
  for (const sample of SAMPLES) {
    try {
      const img = await loadImage(sample.src);
      photos.push({ id: sample.id, label: sample.label, img });
    } catch (err) {
      console.warn('sample missing:', sample.src);
    }
  }
}

function drawPreview() {
  if (!previewCanvas || !photos.length) return;
  const layout = layoutById(state.layoutId);
  const aspect = layout.id === 'full' ? 16 / 9 : 1;
  const width = 960;
  const height = Math.round(width / aspect);
  if (previewCanvas.width !== width || previewCanvas.height !== height) {
    previewCanvas.width = width;
    previewCanvas.height = height;
  }
  renderCover(previewCtx, width, height, state, photos.map((p) => p.img));
  highlightSelectedPanel();
}

function panelPixelRect(index) {
  const layout = layoutById(state.layoutId);
  const panel = layout.panels[index];
  if (!panel) return null;
  return {
    x: panel.x * previewCanvas.width,
    y: panel.y * previewCanvas.height,
    w: panel.w * previewCanvas.width,
    h: panel.h * previewCanvas.height,
  };
}

function highlightSelectedPanel() {
  const rect = panelPixelRect(state.selectedPanel);
  if (!rect) return;
  previewCtx.save();
  previewCtx.lineWidth = 4;
  previewCtx.strokeStyle = '#ffd23e';
  previewCtx.setLineDash([10, 6]);
  previewCtx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
  previewCtx.restore();
}

function applyLayout(layoutId) {
  pushUndo();
  state.layoutId = layoutId;
  state.panels = defaultPanelState(layoutById(layoutId));
  state.selectedPanel = 0;
  syncControlsFromState();
  drawPreview();
}

function applyGrade(gradeId) {
  pushUndo();
  state.gradeId = gradeId;
  syncControlsFromState();
  drawPreview();
}

function applyPreset(kind) {
  pushUndo();
  if (kind === 'photo') {
    state.layoutId = 'nine';
    state.gradeId = 'sunset';
  } else if (kind === 'hero') {
    state.layoutId = 'hero';
    state.gradeId = 'rose';
  } else if (kind === 'neon') {
    state.layoutId = 'four';
    state.gradeId = 'neon';
  }
  state.panels = defaultPanelState(layoutById(state.layoutId));
  state.selectedPanel = 0;
  syncControlsFromState();
  drawPreview();
}

function syncControlsFromState() {
  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };
  setVal('titleInput', state.title);
  setVal('subtitleInput', state.subtitle);
  setVal('taglineInput', state.tagline);
  document.querySelectorAll('[data-layout]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.layout === state.layoutId);
  });
  document.querySelectorAll('[data-grade]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.grade === state.gradeId);
  });
  syncPanelControls();
}

function syncPanelControls() {
  const layout = layoutById(state.layoutId);
  const panel = state.panels[state.selectedPanel];
  const label = document.getElementById('panelLabel');
  if (label) {
    label.textContent = panel
      ? `Panel ${state.selectedPanel + 1} of ${layout.panels.length}`
      : 'No panel selected';
  }
  const photoSelect = document.getElementById('panelPhoto');
  if (photoSelect) {
    photoSelect.innerHTML = photos
      .map((p, i) => `<option value="${i}">${p.label}</option>`)
      .join('');
    if (panel) photoSelect.value = String(panel.photo);
  }
  const zoom = document.getElementById('panelZoom');
  if (zoom && panel) zoom.value = String(panel.zoom);
  const ox = document.getElementById('panelOx');
  if (ox && panel) ox.value = String(panel.ox);
  const oy = document.getElementById('panelOy');
  if (oy && panel) oy.value = String(panel.oy);
}

function buildPickerButtons() {
  const layoutBox = document.getElementById('layoutPicker');
  if (layoutBox) {
    layoutBox.innerHTML = '';
    for (const layout of LAYOUTS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.layout = layout.id;
      btn.textContent = layout.name;
      btn.title = layout.blurb;
      btn.addEventListener('click', () => applyLayout(layout.id));
      layoutBox.appendChild(btn);
    }
  }
  const gradeBox = document.getElementById('gradePicker');
  if (gradeBox) {
    gradeBox.innerHTML = '';
    for (const grade of GRADES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.grade = grade.id;
      btn.textContent = grade.name;
      btn.addEventListener('click', () => applyGrade(grade.id));
      gradeBox.appendChild(btn);
    }
  }
  const sampleBox = document.getElementById('samplePicker');
  if (sampleBox) {
    sampleBox.innerHTML = '';
    SAMPLES.forEach((sample, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sample-btn';
      btn.innerHTML = `<img src="${sample.src}" alt="${sample.label}"><span>${sample.label}</span>`;
      btn.addEventListener('click', () => {
        pushUndo();
        state.panels[state.selectedPanel].photo = i;
        syncPanelControls();
        drawPreview();
      });
      sampleBox.appendChild(btn);
    });
  }
}

function exportCover(size) {
  const canvas = renderCoverToCanvas(size.w, size.h, state, photos.map((p) => p.img));
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palm-heat-cover-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, 'image/png');
}

function wireEditor() {
  previewCanvas = document.getElementById('previewCanvas');
  previewCtx = previewCanvas.getContext('2d');

  previewCanvas.addEventListener('click', (event) => {
    const rect = previewCanvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const layout = layoutById(state.layoutId);
    const hit = layout.panels.findIndex(
      (p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h,
    );
    if (hit >= 0) {
      state.selectedPanel = hit;
      syncPanelControls();
      drawPreview();
    }
  });

  const upload = document.getElementById('photoUpload');
  upload.addEventListener('change', async () => {
    for (const file of upload.files) {
      const url = URL.createObjectURL(file);
      try {
        const img = await loadImage(url);
        photos.push({ id: 'upload-' + photos.length, label: file.name, img });
      } catch (err) {
        console.warn('upload failed:', file.name);
      }
    }
    upload.value = '';
    pushUndo();
    syncPanelControls();
    drawPreview();
  });

  document.getElementById('titleInput').addEventListener('input', (e) => {
    state.title = e.target.value;
    drawPreview();
  });
  document.getElementById('subtitleInput').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    drawPreview();
  });
  document.getElementById('taglineInput').addEventListener('input', (e) => {
    state.tagline = e.target.value;
    drawPreview();
  });
  document.getElementById('titleInput').addEventListener('change', pushUndo);
  document.getElementById('subtitleInput').addEventListener('change', pushUndo);
  document.getElementById('taglineInput').addEventListener('change', pushUndo);

  document.getElementById('panelPhoto').addEventListener('change', (e) => {
    pushUndo();
    state.panels[state.selectedPanel].photo = Number(e.target.value);
    drawPreview();
  });
  document.getElementById('panelZoom').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].zoom = Number(e.target.value);
    drawPreview();
  });
  document.getElementById('panelZoom').addEventListener('change', pushUndo);
  document.getElementById('panelOx').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].ox = Number(e.target.value);
    drawPreview();
  });
  document.getElementById('panelOx').addEventListener('change', pushUndo);
  document.getElementById('panelOy').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].oy = Number(e.target.value);
    drawPreview();
  });
  document.getElementById('panelOy').addEventListener('change', pushUndo);

  document.getElementById('fillAllBtn').addEventListener('click', () => {
    pushUndo();
    const photo = state.panels[state.selectedPanel].photo;
    state.panels.forEach((p) => { p.photo = photo; });
    drawPreview();
  });

  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });
  document.getElementById('undoBtn').addEventListener('click', undoCover);
  document.getElementById('redoBtn').addEventListener('click', redoCover);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      undoCover();
    } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
      e.preventDefault();
      redoCover();
    }
  });

  EXPORT_SIZES.forEach((size) => {
    const btn = document.getElementById(`export-${size.w}x${size.h}`);
    if (btn) btn.addEventListener('click', () => exportCover(size));
  });

  buildPickerButtons();
  syncControlsFromState();
  refreshUndoButtons();
}

async function runShotMode(params) {
  document.body.classList.add('shot-mode');
  const layoutId = params.get('layout') || 'nine';
  const gradeId = params.get('grade') || 'sunset';
  const w = Number(params.get('w') || window.innerWidth);
  const h = Number(params.get('h') || window.innerHeight);
  state.layoutId = layoutId;
  state.gradeId = gradeId;
  state.panels = defaultPanelState(layoutById(layoutId));
  await loadSamplePhotos();
  await document.fonts.load('80px Anton');
  await document.fonts.load('40px Pacifico');
  await document.fonts.ready;
  const canvas = document.getElementById('previewCanvas');
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  const ctx = canvas.getContext('2d');
  renderCover(ctx, w, h, state, photos.map((p) => p.img));
  document.title = 'cover-ready';
}

async function startApp() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('shot') === 'cover') {
    await runShotMode(params);
    return;
  }
  await loadSamplePhotos();
  try {
    await document.fonts.load('80px Anton');
    await document.fonts.load('40px Pacifico');
    await document.fonts.ready;
  } catch (err) {
    console.warn('fonts not ready yet, rendering anyway');
  }
  wireEditor();
  drawPreview();
  document.title = 'editor-ready';
}

startApp();
