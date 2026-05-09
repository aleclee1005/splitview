const LAYOUT_SPECS = {
  '2h':  ['h', 'p', 'p'],
  '2v':  ['v', 'p', 'p'],
  '3r':  ['h', 'p', ['v', 'p', 'p']],
  '3l':  ['h', ['v', 'p', 'p'], 'p'],
  '3t':  ['v', ['h', 'p', 'p'], 'p'],
  '3b':  ['v', 'p', ['h', 'p', 'p']],
  '4':   ['v', ['h', 'p', 'p'], ['h', 'p', 'p']],
  '4r':  ['h', 'p', ['v', 'p', 'p', 'p']],
  '4t':  ['v', ['h', 'p', 'p', 'p'], 'p'],
};

const params = new URLSearchParams(location.search);
const layoutId = params.get('layout') || '2h';
let panelIndex = 0;

// ===== Utilities =====

function normalizeUrl(raw) {
  const s = raw.trim();
  if (!s) return '';
  if (/^(https?|file|chrome):\/\//i.test(s)) return s;
  if (/^localhost(:\d+)?(\/|$)/.test(s)) return 'http://' + s;
  return 'https://' + s;
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== Autocomplete dropdown (shared singleton) =====

const dropdown = document.createElement('div');
dropdown.className = 'url-dropdown';
dropdown.style.display = 'none';
document.body.appendChild(dropdown);

let ddInput = null;
let ddItems = [];
let ddSel = -1;

function showDropdown(input, items) {
  ddInput = input;
  ddItems = items;
  ddSel = -1;

  if (!items.length) { hideDropdown(); return; }

  const rect = input.getBoundingClientRect();
  dropdown.style.left = rect.left + 'px';
  dropdown.style.top = (rect.bottom + 3) + 'px';
  dropdown.style.width = Math.max(rect.width, 320) + 'px';

  dropdown.innerHTML = items.map((s, i) => {
    const icon = s.type === 'tab'
      ? `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="1.5" stroke="#7a8a9a" stroke-width="1.3"/><path d="M1 6h12" stroke="#7a8a9a" stroke-width="1.3"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#7a8a9a" stroke-width="1.3"/><polyline points="7,4 7,7 9,9" stroke="#7a8a9a" stroke-width="1.3" stroke-linecap="round"/></svg>`;
    return `<div class="dd-item" data-idx="${i}">${icon}<div class="dd-text"><div class="dd-title">${escapeHtml(s.title || s.url)}</div><div class="dd-url">${escapeHtml(s.url)}</div></div></div>`;
  }).join('');

  dropdown.querySelectorAll('.dd-item').forEach(el => {
    el.addEventListener('mousedown', e => {
      e.preventDefault();
      const s = ddItems[parseInt(el.dataset.idx)];
      if (ddInput && s) ddInput._navigate(s.url);
      hideDropdown();
    });
  });

  dropdown.style.display = 'block';
  renderDdSel();
}

function hideDropdown() {
  dropdown.style.display = 'none';
  ddInput = null;
  ddItems = [];
  ddSel = -1;
}

function renderDdSel() {
  dropdown.querySelectorAll('.dd-item').forEach((el, i) => {
    el.classList.toggle('selected', i === ddSel);
    if (i === ddSel) el.scrollIntoView({ block: 'nearest' });
  });
}

document.addEventListener('click', e => {
  if (!dropdown.contains(e.target) && e.target !== ddInput) hideDropdown();
});

async function fetchSuggestions(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  const seen = new Set();
  const out = [];

  try {
    const [hist, tabs] = await Promise.all([
      chrome.history.search({ text: query, maxResults: 10, startTime: 0 }),
      chrome.tabs.query({})
    ]);

    tabs
      .filter(t => t.url && (t.url.toLowerCase().includes(q) || (t.title || '').toLowerCase().includes(q)))
      .slice(0, 3)
      .forEach(t => {
        if (!seen.has(t.url)) { seen.add(t.url); out.push({ url: t.url, title: t.title || t.url, type: 'tab' }); }
      });

    hist.forEach(h => {
      if (h.url && !seen.has(h.url)) { seen.add(h.url); out.push({ url: h.url, title: h.title || h.url, type: 'history' }); }
    });
  } catch {}

  return out.slice(0, 9);
}

// ===== SVG icons for toolbar =====

const ICON_SPLIT_H = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.75" y="0.75" width="4.5" height="11.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/><rect x="7.75" y="0.75" width="4.5" height="11.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/></svg>`;
const ICON_SPLIT_V = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.75" y="0.75" width="11.5" height="4.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/><rect x="0.75" y="7.75" width="11.5" height="4.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/></svg>`;
const ICON_CLOSE = `<svg width="10" height="10" viewBox="0 0 10 10"><line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

function mkBtn(content, title, isSvg = false) {
  const btn = document.createElement('button');
  btn.className = 'toolbar-btn';
  btn.title = title;
  if (isSvg) btn.innerHTML = content;
  else btn.textContent = content;
  return btn;
}

// ===== Panel =====

function createPanel(idx) {
  const initUrl = params.get(`url${idx}`) || '';

  const panel = document.createElement('div');
  panel.className = 'panel';

  const bar = document.createElement('div');
  bar.className = 'panel-bar';

  const num = document.createElement('div');
  num.className = 'panel-num';
  num.textContent = idx + 1;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'url-input';
  input.placeholder = 'URLまたはキーワードを入力';
  input.spellcheck = false;
  input.autocomplete = 'off';

  const btnGo     = mkBtn('→', '移動');
  const btnReload = mkBtn('↻', '再読み込み');
  const btnClose  = mkBtn(ICON_CLOSE, 'パネルを削除', true);
  btnClose.classList.add('btn-danger');

  bar.append(num, input, btnGo, btnReload, btnClose);

  const frameWrap = document.createElement('div');
  frameWrap.className = 'panel-frame';

  const iframe = document.createElement('iframe');
  iframe.allow = 'fullscreen; autoplay; encrypted-media; picture-in-picture';

  const overlay = document.createElement('div');
  overlay.className = 'frame-overlay';

  frameWrap.append(iframe, overlay);
  panel.append(bar, frameWrap);

  function navigate(raw) {
    const url = normalizeUrl(raw);
    if (!url) return;
    input.value = url;
    hideDropdown();
    iframe.src = url;
  }
  input._navigate = navigate;

  iframe.addEventListener('load', () => {
    try {
      const href = iframe.contentWindow.location.href;
      if (href && href !== 'about:blank') input.value = href;
    } catch {}
  });

  // Autocomplete
  let suggestTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(suggestTimer);
    const q = input.value.trim();
    if (!q) { hideDropdown(); return; }
    suggestTimer = setTimeout(async () => {
      const items = await fetchSuggestions(q);
      if (document.activeElement === input) showDropdown(input, items);
    }, 180);
  });

  input.addEventListener('focus', async () => {
    input.select();
    const q = input.value.trim();
    if (q) {
      const items = await fetchSuggestions(q);
      showDropdown(input, items);
    }
  });

  input.addEventListener('blur', () => setTimeout(hideDropdown, 160));

  input.addEventListener('keydown', e => {
    const ddOpen = dropdown.style.display !== 'none' && ddInput === input;
    if (ddOpen) {
      if (e.key === 'ArrowDown') { e.preventDefault(); ddSel = Math.min(ddSel + 1, ddItems.length - 1); renderDdSel(); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); ddSel = Math.max(ddSel - 1, -1); renderDdSel(); return; }
      if (e.key === 'Escape')    { hideDropdown(); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (ddSel >= 0) { navigate(ddItems[ddSel].url); }
        else { navigate(input.value); }
        hideDropdown();
        return;
      }
    } else {
      if (e.key === 'Enter') navigate(input.value);
    }
  });

  btnGo.addEventListener('click', () => navigate(input.value));
  btnReload.addEventListener('click', () => {
    try { iframe.contentWindow.location.reload(); }
    catch { iframe.src = iframe.src; }
  });
  btnClose.addEventListener('click', () => removePanel(panel));

  if (initUrl) navigate(initUrl);
  return panel;
}

// ===== Panel split & remove =====

function splitPanel(panel, dir) {
  const parent = panel.parentElement;
  const flexVal = panel.style.flexGrow || '1';

  const group = document.createElement('div');
  group.className = `group group-${dir}`;
  group.dataset.dir = dir;
  group.style.cssText = `flex-grow:${flexVal};flex-shrink:1;flex-basis:0;min-width:0;min-height:0;`;

  const divider = document.createElement('div');
  divider.className = `divider divider-${dir}`;
  divider.addEventListener('mousedown', e => startResize(e, divider));

  const newPanel = createPanel(panelIndex++);
  panel.style.flexGrow = '1';

  group.append(panel, divider, newPanel);
  parent.replaceChild(group, panel);
  renumberPanels();
}

function removePanel(panel) {
  const parent = panel.parentElement;
  if (!parent) return;

  const siblings = [...parent.children];
  const idx = siblings.indexOf(panel);
  const before = idx > 0 ? siblings[idx - 1] : null;
  const after  = idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const divider = before?.classList.contains('divider') ? before
                : after?.classList.contains('divider')  ? after : null;

  panel.remove();
  divider?.remove();

  // Unwrap group if only one content child remains
  const remaining = [...parent.children].filter(c => !c.classList.contains('divider'));
  if (remaining.length === 1 && parent.id !== 'root') {
    const gp = parent.parentElement;
    const child = remaining[0];
    child.style.flexGrow = parent.style.flexGrow || '1';
    child.style.minWidth = '0';
    child.style.minHeight = '0';
    gp.replaceChild(child, parent);
  }

  renumberPanels();
}

function renumberPanels() {
  document.querySelectorAll('.panel-num').forEach((el, i) => el.textContent = i + 1);
}

// ===== Layout builder =====

function buildTree(spec) {
  if (spec === 'p') return createPanel(panelIndex++);

  const [dir, ...children] = spec;
  const g = document.createElement('div');
  g.className = `group group-${dir}`;
  g.dataset.dir = dir;

  children.forEach((child, i) => {
    if (i > 0) {
      const div = document.createElement('div');
      div.className = `divider divider-${dir}`;
      div.addEventListener('mousedown', e => startResize(e, div));
      g.appendChild(div);
    }
    g.appendChild(buildTree(child));
  });

  return g;
}

// ===== Resize drag =====

function startResize(e, divider) {
  e.preventDefault();

  const container = divider.parentElement;
  const isH = container.dataset.dir === 'h';
  const prev = divider.previousElementSibling;
  const next = divider.nextElementSibling;
  if (!prev || !next) return;

  const pr = prev.getBoundingClientRect();
  const nr = next.getBoundingClientRect();
  const prevPx0 = isH ? pr.width : pr.height;
  const nextPx0 = isH ? nr.width : nr.height;
  const total = prevPx0 + nextPx0;
  const coord0 = isH ? e.clientX : e.clientY;
  const flexSum = (parseFloat(prev.style.flexGrow) || 1) + (parseFloat(next.style.flexGrow) || 1);

  divider.classList.add('dragging');
  document.querySelectorAll('.frame-overlay').forEach(o => o.style.pointerEvents = 'all');
  document.body.style.cursor = isH ? 'col-resize' : 'row-resize';
  document.body.style.userSelect = 'none';

  function onMove(e) {
    const delta = (isH ? e.clientX : e.clientY) - coord0;
    const newPrev = Math.max(80, Math.min(total - 80, prevPx0 + delta));
    const r = newPrev / total;
    prev.style.flexGrow = String(r * flexSum);
    next.style.flexGrow = String((1 - r) * flexSum);
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    divider.classList.remove('dragging');
    document.querySelectorAll('.frame-overlay').forEach(o => o.style.pointerEvents = '');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ===== Broadcast (send same message to all panels) =====

// Runs INSIDE each iframe — no closure access, must be self-contained
function frameInjector(text, autoSubmit) {
  // Only run inside iframes, not the main splitview page
  if (window === window.top) return 'skipped:top';

  // Recursively collect editable elements, piercing shadow DOMs
  function collectEditables(root) {
    const found = [];
    try {
      const els = root.querySelectorAll('[contenteditable="true"], [role="textbox"], textarea');
      found.push(...els);
      root.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) found.push(...collectEditables(el.shadowRoot));
      });
    } catch {}
    return found;
  }

  function isVisible(el) {
    try {
      const r = el.getBoundingClientRect();
      return r.width > 40 && r.height > 10;
    } catch { return false; }
  }

  const candidates = collectEditables(document).filter(isVisible);
  if (!candidates.length) return 'no-input';

  // Prefer the last candidate (usually the main input at the bottom)
  const el = candidates[candidates.length - 1];
  el.focus();

  if (el.tagName === 'TEXTAREA') {
    try {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(el, text);
    } catch { el.value = text; }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    // contenteditable — execCommand is most reliable for React/Vue apps
    try {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
    } catch {
      el.innerText = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    }
  }

  if (autoSubmit) {
    setTimeout(() => {
      const sendSelectors = [
        'button[data-testid*="send"]',
        'button[aria-label*="send" i]',
        'button[aria-label*="送信" i]',
        '[data-testid="send-button"]',
        'button[type="submit"]',
        'button[class*="send" i]',
      ];
      for (const sel of sendSelectors) {
        const btn = document.querySelector(sel);
        if (btn && !btn.disabled) { btn.click(); return; }
      }
      // Fallback: Enter key
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    }, 300);
  }

  return 'ok';
}

async function broadcastMessage() {
  const text = document.getElementById('broadcast-input').value.trim();
  if (!text) { document.getElementById('broadcast-input').focus(); return; }

  const autoSubmit = document.getElementById('auto-submit-check').checked;
  const btn = document.getElementById('broadcast-btn');
  btn.textContent = '送信中...';
  btn.disabled = true;

  try {
    const tab = await chrome.tabs.getCurrent();
    if (!tab?.id) throw new Error('tab not found');

    // Send to all frames via content script (content.js handles injection in each iframe)
    await chrome.tabs.sendMessage(tab.id, {
      type: 'SPLITVIEW_INJECT',
      text,
      autoSubmit,
    });

    btn.textContent = '✓ 送信済み';
    btn.classList.add('bc-sent');
  } catch (err) {
    console.error('Broadcast error:', err);
    btn.textContent = '⚠ エラー';
    btn.classList.add('bc-warn');
  }

  setTimeout(() => {
    btn.textContent = '全送信';
    btn.disabled = false;
    btn.classList.remove('bc-sent', 'bc-warn');
  }, 2000);
}

document.getElementById('broadcast-btn').addEventListener('click', broadcastMessage);
document.getElementById('broadcast-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') broadcastMessage();
});

// ===== Save preset =====

const saveFloat = document.getElementById('btn-save-float');
const saveOverlay = document.getElementById('save-overlay');
const presetNameInput = document.getElementById('preset-name-input');
const modalPreview = document.getElementById('modal-preview');

function openSaveModal() {
  const urls = [...document.querySelectorAll('.url-input')].map(el => el.value.trim()).filter(Boolean);
  modalPreview.innerHTML = '';
  urls.slice(0, 4).forEach(u => {
    const chip = document.createElement('div');
    chip.className = 'modal-chip';
    chip.textContent = (() => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } })();
    modalPreview.appendChild(chip);
  });
  presetNameInput.value = '';
  saveOverlay.hidden = false;
  presetNameInput.focus();
}

function closeSaveModal() {
  saveOverlay.hidden = true;
}

async function savePreset() {
  const name = presetNameInput.value.trim();
  if (!name) { presetNameInput.focus(); return; }

  const urls = [...document.querySelectorAll('.url-input')].map(el => el.value.trim());
  const preset = { id: Date.now().toString(), name, layout: layoutId, urls };

  const { presets = [] } = await chrome.storage.local.get('presets');
  presets.push(preset);
  await chrome.storage.local.set({ presets });
  closeSaveModal();

  // Brief confirm flash
  saveFloat.classList.add('saved');
  setTimeout(() => saveFloat.classList.remove('saved'), 1500);
}

saveFloat.addEventListener('click', openSaveModal);
document.getElementById('btn-modal-cancel').addEventListener('click', closeSaveModal);
document.getElementById('btn-modal-save').addEventListener('click', savePreset);
presetNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') savePreset();
  if (e.key === 'Escape') closeSaveModal();
});
saveOverlay.addEventListener('click', e => { if (e.target === saveOverlay) closeSaveModal(); });

// ===== Init =====

const spec = LAYOUT_SPECS[layoutId] || LAYOUT_SPECS['2h'];
document.getElementById('root').appendChild(buildTree(spec));
