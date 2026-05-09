// ===== Layout thumbnails =====

const LAYOUTS = [
  { id: '2h', label: '左右均等', panels: 2, grid: 'grid-2', svg: `<svg width="90" height="56" viewBox="0 0 90 56"><rect x="1" y="1" width="40" height="54" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="1" width="40" height="54" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/></svg>` },
  { id: '2v', label: '上下均等', panels: 2, grid: 'grid-2', svg: `<svg width="90" height="56" viewBox="0 0 90 56"><rect x="1" y="1" width="88" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="1" y="30" width="88" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/></svg>` },
  { id: '3r', label: '左1＋右2', panels: 3, grid: 'grid-3', svg: `<svg width="90" height="56" viewBox="0 0 90 56"><rect x="1" y="1" width="40" height="54" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="1" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="30" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/></svg>` },
  { id: '3l', label: '左2＋右1', panels: 3, grid: 'grid-3', svg: `<svg width="90" height="56" viewBox="0 0 90 56"><rect x="1" y="1" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="1" y="30" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="1" width="40" height="54" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/></svg>` },
  { id: '3t', label: '上2＋下1', panels: 3, grid: 'grid-3', svg: `<svg width="90" height="56" viewBox="0 0 90 56"><rect x="1" y="1" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="1" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="1" y="30" width="88" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/></svg>` },
  { id: '3b', label: '上1＋下2', panels: 3, grid: 'grid-3', svg: `<svg width="90" height="56" viewBox="0 0 90 56"><rect x="1" y="1" width="88" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="1" y="30" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="30" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/></svg>` },
  { id: '4',  label: '2×2グリッド', panels: 4, grid: 'grid-4', svg: `<svg width="90" height="56" viewBox="0 0 90 56"><rect x="1" y="1" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="1" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="1" y="30" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="30" width="40" height="25" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/></svg>` },
  { id: '4r', label: '左1＋右3', panels: 4, grid: 'grid-4', svg: `<svg width="90" height="56" viewBox="0 0 90 56"><rect x="1" y="1" width="40" height="54" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="1" width="40" height="15" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="20" width="40" height="16" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="49" y="40" width="40" height="15" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/></svg>` },
  { id: '4t', label: '上3＋下1', panels: 4, grid: 'grid-4', svg: `<svg width="90" height="56" viewBox="0 0 90 56"><rect x="1" y="1" width="26" height="35" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="32" y="1" width="26" height="35" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="63" y="1" width="26" height="35" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/><rect x="1" y="40" width="88" height="15" rx="3" fill="#e8f0fe" stroke="#4a9eff" stroke-width="1.5"/></svg>` },
];

// Layout SVG map (id → svg string, resized to small thumbnail)
const LAYOUT_SVG_MAP = Object.fromEntries(
  LAYOUTS.map(l => [l.id, l.svg.replace(/width="\d+"/, 'width="40"').replace(/height="\d+"/, 'height="25"')])
);

// ===== Default presets =====

const DEFAULT_PRESETS = [
  {
    id: 'ai3',
    name: 'AI 3分割',
    layout: '3r',
    urls: ['https://gemini.google.com/app', 'https://claude.ai', 'https://chatgpt.com'],
    builtin: true,
  },
];

// ===== Helpers =====

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

function faviconUrl(url) {
  try {
    return `https://www.google.com/s2/favicons?sz=16&domain=${encodeURIComponent(new URL(url).origin)}`;
  } catch { return ''; }
}

async function openPreset(preset) {
  const p = new URLSearchParams({ layout: preset.layout });
  preset.urls.forEach((u, i) => { if (u) p.set(`url${i}`, u); });
  await chrome.tabs.create({ url: chrome.runtime.getURL('splitview.html') + '?' + p });
  window.close();
}

async function openLayout(layoutId) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const cur = (tab?.url && !tab.url.startsWith('chrome://')) ? tab.url : '';
  const p = new URLSearchParams({ layout: layoutId });
  if (cur) p.set('url0', cur);
  await chrome.tabs.create({ url: chrome.runtime.getURL('splitview.html') + '?' + p });
  window.close();
}

// ===== Edit modal (shared) =====

let editTarget = null; // { preset, nameEl, chipsEl, onSaved }

document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
document.getElementById('edit-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('edit-overlay')) closeEditModal();
});
document.getElementById('edit-save').addEventListener('click', commitEdit);
document.getElementById('edit-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') commitEdit();
  if (e.key === 'Escape') closeEditModal();
});

function openEditModal(preset, nameEl, chipsEl, onSaved) {
  editTarget = { preset: { ...preset }, nameEl, chipsEl, onSaved };

  document.getElementById('edit-name').value = preset.name;

  const list = document.getElementById('edit-url-list');
  list.innerHTML = '';
  preset.urls.forEach((u, i) => {
    const row = document.createElement('div');
    row.className = 'edit-modal-row';
    const label = document.createElement('label');
    label.textContent = `パネル ${i + 1}`;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = u;
    inp.placeholder = 'https://...';
    inp.dataset.urlIdx = i;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') closeEditModal(); });
    row.append(label, inp);
    list.appendChild(row);
  });

  document.getElementById('edit-overlay').hidden = false;
  document.getElementById('edit-name').focus();
}

function closeEditModal() {
  document.getElementById('edit-overlay').hidden = true;
  editTarget = null;
}

async function commitEdit() {
  if (!editTarget) return;
  const { preset, nameEl, chipsEl, onSaved } = editTarget;

  const newName = document.getElementById('edit-name').value.trim() || preset.name;
  const newUrls = [...document.getElementById('edit-url-list').querySelectorAll('input')].map(i => i.value.trim());
  const updated = { ...preset, name: newName, urls: newUrls, builtin: false };

  // Update card display (SVG stays same; name used in title tooltip)
  nameEl.title = newName;
  refreshChips(chipsEl, newUrls);

  // Persist
  const { presets = [] } = await chrome.storage.local.get('presets');
  const idx = presets.findIndex(p => p.id === updated.id);
  if (idx >= 0) presets[idx] = updated;
  else presets.push(updated);
  await chrome.storage.local.set({ presets });

  closeEditModal();
  if (onSaved) onSaved(updated);
}

function refreshChips(container, urls) {
  container.innerHTML = '';
  urls.slice(0, 4).forEach(u => {
    const chip = document.createElement('div');
    chip.className = 'url-chip';
    const img = document.createElement('img');
    img.src = faviconUrl(u);
    img.width = 12; img.height = 12;
    img.onerror = () => img.remove();
    chip.append(img, Object.assign(document.createElement('span'), { textContent: domainOf(u) }));
    container.appendChild(chip);
  });
}

// ===== Preset card builder =====

function buildPresetCard(preset) {
  let current = { ...preset };

  const card = document.createElement('div');
  card.className = 'preset-card';

  const info = document.createElement('div');
  info.className = 'preset-info';

  // Small layout SVG instead of text name
  const nameEl = document.createElement('div');
  nameEl.className = 'preset-layout-thumb';
  nameEl.innerHTML = LAYOUT_SVG_MAP[current.layout] || `<span class="preset-name">${current.name}</span>`;
  nameEl.title = current.name;

  const chipsEl = document.createElement('div');
  chipsEl.className = 'preset-urls';
  refreshChips(chipsEl, current.urls);

  info.append(nameEl, chipsEl);

  const actions = document.createElement('div');
  actions.className = 'preset-actions';

  const btnOpen = document.createElement('button');
  btnOpen.className = 'preset-open-btn';
  btnOpen.textContent = '開く';
  btnOpen.addEventListener('click', () => openPreset(current));

  const btnEdit = document.createElement('button');
  btnEdit.className = 'preset-icon-btn';
  btnEdit.title = '編集';
  btnEdit.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2L4 11H2V9L9 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  btnEdit.addEventListener('click', () => {
    openEditModal(current, nameEl, chipsEl, updated => { current = updated; });
  });

  actions.append(btnOpen, btnEdit);

  if (!preset.builtin) {
    const btnDel = document.createElement('button');
    btnDel.className = 'preset-icon-btn preset-del-btn';
    btnDel.title = '削除';
    btnDel.innerHTML = `<svg width="11" height="11" viewBox="0 0 11 11"><line x1="1.5" y1="1.5" x2="9.5" y2="9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="9.5" y1="1.5" x2="1.5" y2="9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    btnDel.addEventListener('click', async () => {
      const { presets = [] } = await chrome.storage.local.get('presets');
      await chrome.storage.local.set({ presets: presets.filter(p => p.id !== current.id) });
      card.remove();
    });
    actions.appendChild(btnDel);
  }

  card.append(info, actions);
  return card;
}

// ===== Init =====

async function init() {
  const container = document.getElementById('presets-container');
  container.innerHTML = '';

  // Merge: storage overrides builtins with same id
  const { presets: stored = [] } = await chrome.storage.local.get('presets');
  const storedById = Object.fromEntries(stored.map(p => [p.id, p]));

  const allPresets = [
    ...DEFAULT_PRESETS.map(p => storedById[p.id] || p),
    ...stored.filter(p => !DEFAULT_PRESETS.find(d => d.id === p.id)),
  ];

  if (allPresets.length === 0) {
    container.innerHTML = '<div class="presets-empty">保存済みプリセットはありません</div>';
  } else {
    allPresets.forEach(p => container.appendChild(buildPresetCard(p)));
  }

  // Layout buttons
  LAYOUTS.forEach(({ id, label, grid, svg }) => {
    const btn = document.createElement('button');
    btn.className = 'layout-btn';
    btn.innerHTML = svg + `<span>${label}</span>`;
    btn.addEventListener('click', () => openLayout(id));
    document.getElementById(grid).appendChild(btn);
  });
}

init();
