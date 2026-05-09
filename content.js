// Content script — runs in every frame of every page (including iframes)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'SPLITVIEW_INJECT') return false;

  // Skip the top-level page (the splitview shell itself)
  if (window === window.top) {
    sendResponse({ status: 'skipped' });
    return false;
  }

  doInject(message.text, message.autoSubmit);
  sendResponse({ status: 'ok', url: location.href });
  return false;
});

function doInject(text, autoSubmit) {
  // Collect all editable elements, piercing shadow DOMs
  const found = [];
  const queue = [document];
  while (queue.length) {
    const root = queue.shift();
    try {
      root.querySelectorAll('[contenteditable="true"], [role="textbox"], textarea')
        .forEach(el => found.push(el));
      root.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) queue.push(el.shadowRoot);
      });
    } catch {}
  }

  const visible = found.filter(el => {
    try {
      const r = el.getBoundingClientRect();
      return r.width > 40 && r.height > 10;
    } catch { return false; }
  });

  if (!visible.length) return;

  const el = visible[visible.length - 1];
  el.focus();

  if (el.tagName === 'TEXTAREA') {
    try {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
        .set.call(el, text);
    } catch { el.value = text; }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    // contenteditable (React/Vue/Svelte apps)
    el.focus();
    document.execCommand('selectAll', false, null);
    if (!document.execCommand('insertText', false, text)) {
      el.innerText = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    }
  }

  if (autoSubmit) {
    // Retry loop: up to 5 attempts, 200ms apart.
    // React may keep the send button disabled for ~300ms while processing the input event.
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 200;

    function trySubmit() {
      attempts++;

      // 1. ChatGPT: data-testid="send-button"
      const testIdBtn = document.querySelector('button[data-testid="send-button"]');
      if (testIdBtn && !testIdBtn.disabled && testIdBtn.getAttribute('aria-disabled') !== 'true') {
        testIdBtn.click(); return;
      }

      // 2. Gemini / Claude: aria-label containing "send" (case-insensitive, full document)
      const ariaBtn = [...document.querySelectorAll('button[aria-label]')].find(b => {
        if (b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
        return /send/i.test(b.getAttribute('aria-label'));
      });
      if (ariaBtn) { ariaBtn.click(); return; }

      // 3. Any enabled button whose label/testid/title mentions send/submit
      const labelBtn = [...document.querySelectorAll('button, [role="button"]')].find(b => {
        if (b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
        const label = [b.getAttribute('aria-label'), b.getAttribute('data-testid'), b.title, b.name]
          .filter(Boolean).join(' ').toLowerCase();
        return label.includes('send') || label.includes('submit') || label.includes('送信');
      });
      if (labelBtn) { labelBtn.click(); return; }

      // 4. Any visible, enabled button near the bottom of the viewport (y > 55% of viewport height)
      const bottomBtn = [...document.querySelectorAll('button, [role="button"]')].find(b => {
        if (b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
        try {
          const r = b.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top > window.innerHeight * 0.55;
        } catch { return false; }
      });
      if (bottomBtn) { bottomBtn.click(); return; }

      // Retry if we haven't exhausted attempts
      if (attempts < maxAttempts) {
        setTimeout(trySubmit, retryDelay);
        return;
      }

      // 5. Last resort: Enter key on the input element
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    }

    setTimeout(trySubmit, retryDelay);
  }
}
