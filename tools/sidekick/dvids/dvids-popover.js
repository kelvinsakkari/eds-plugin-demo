const API_BASE_SEARCH = 'https://api.dvidshub.net/search';
const API_BASE_ASSET = 'https://api.dvidshub.net/asset';
const API_KEY = 'key-6911edd214ab0'; // keep secret; consider a proxy for production.
const MAX_RESULTS = 20;

let page = 1;

const els = {
  q: document.getElementById('q'),
  aspect: document.getElementById('aspect'),
  branch: document.getElementById('branch'),
  sort: document.getElementById('sort'),
  sortdir: document.getElementById('sortdir'),
  search: document.getElementById('search'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  grid: document.getElementById('grid'),
  status: document.getElementById('status'),
};

function setStatus(text) {
  els.status.textContent = text;
  console.log('[STATUS]', text);
}

function buildSearchUrl(params) {
  const u = new URL(API_BASE_SEARCH);
  const p = new URLSearchParams();
  p.set('api_key', API_KEY);
  p.set('type[]', 'image');
  if (params.q) p.set('q', params.q);
  if (params.aspect_ratio) p.set('aspect_ratio', params.aspect_ratio);
  if (params.branch) p.set('branch', params.branch);
  p.set('sort', params.sort || 'date');
  p.set('sortdir', params.sortdir || 'desc');
  p.set('page', params.page || 1);
  p.set('max_results', String(MAX_RESULTS));
  p.set('thumb_width', '256');
  p.set('thumb_quality', '80');
  u.search = p.toString();
  return u.toString();
}

async function search(pageOverride) {
  page = typeof pageOverride === 'number' ? pageOverride : page;
  const params = {
    q: els.q.value.trim(),
    aspect_ratio: els.aspect.value,
    branch: els.branch.value,
    sort: els.sort.value,
    sortdir: els.sortdir.value,
    page,
  };

  setStatus('Searching…');
  try {
    const url = buildSearchUrl(params);
    console.log('[SEARCH URL]', url);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();

    const results = Array.isArray(data.results) ? data.results : [];
    console.log('[SEARCH RESULTS]', results);
    renderGrid(results);
    setStatus(`Page ${page} — ${results.length} results`);
  } catch (e) {
    console.error('[SEARCH ERROR]', e);
    setStatus(`Error: ${e.message}`);
  }
}

function renderGrid(items) {
  els.grid.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = item.thumbnail;
    img.alt = item.title || '';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = item.title || '';
    card.append(img, meta);
    card.addEventListener('click', () => onSelect(item, card));
    els.grid.appendChild(card);
  });
}

function showCopiedOverlay(card) {
  const overlay = document.createElement('div');
  overlay.className = 'copied-overlay';
  overlay.textContent = '✅ Image copied';
  card.appendChild(overlay);

  setTimeout(() => overlay.remove(), 1500);
}

function onSelect(item, card) {
  console.log('[CLICK]', item.id, 'document.hasFocus=', document.hasFocus());
  window.focus();
  console.log('[AFTER window.focus] document.hasFocus=', document.hasFocus());

  setStatus('Fetching full asset…');

  (async () => {
    try {
      const assetUrl = `${API_BASE_ASSET}?id=${encodeURIComponent(item.id)}&api_key=${API_KEY}`;
      console.log('[ASSET URL]', assetUrl);
      const res = await fetch(assetUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Asset API failed: ${res.status}`);
      const data = await res.json();
      console.log('[ASSET DATA]', data);
      const fullImageUrl = data.results?.image;
      if (!fullImageUrl) throw new Error('No full image URL found');

      // Store asset data for paste detection
      sessionStorage.setItem('dvids_last_copied', JSON.stringify({
        id: item.id,
        assetData: data.results,
        timestamp: Date.now()
      }));

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = fullImageUrl;
      await img.decode();
      console.log('[IMAGE LOADED]', fullImageUrl, img.naturalWidth, img.naturalHeight);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        console.log('[BLOB CREATED]', blob, 'document.hasFocus=', document.hasFocus());
        try {
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          console.log('[CLIPBOARD WRITE SUCCESS]');
          setStatus('✅ Image copied to clipboard');
          showCopiedOverlay(card);
        } catch (err) {
          console.error('[CLIPBOARD WRITE ERROR]', err);
          setStatus(`❌ Copy failed: ${err.message}`);
        }
      }, 'image/png');
    } catch (err) {
      console.error('[COPY ERROR]', err);
      setStatus(`❌ Copy failed: ${err.message}`);
    }
  })();
}

// Wire UI
els.search.addEventListener('click', () => search(1));
els.next.addEventListener('click', () => search(page + 1));
els.prev.addEventListener('click', () => search(Math.max(1, page - 1)));
els.q.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(1); });

// Detect paste events on the search input
els.q.addEventListener('paste', (e) => {
  console.log('[PASTE EVENT]', e);
  // Access pasted text from clipboardData (synchronous)
  const pastedText = e.clipboardData?.getData('text/plain') || '';
  console.log('[PASTED TEXT]', pastedText);
  if (pastedText) {
    setStatus(`Pasted: ${pastedText.substring(0, 50)}...`);
    // Optionally trigger search after paste
    // setTimeout(() => search(1), 100);
  }
});

// Detect paste events with images and show alt text dialog
document.addEventListener('paste', async (e) => {
  const items = e.clipboardData?.items || [];
  const imageItem = Array.from(items).find(item => item.type.startsWith('image/'));
  
  if (imageItem) {
    console.log('[PASTED IMAGE]', imageItem.type);
    
    // Check if we have a recently copied DVIDS asset
    const lastCopied = sessionStorage.getItem('dvids_last_copied');
    if (lastCopied) {
      try {
        const { id, assetData, timestamp } = JSON.parse(lastCopied);
        // Only show dialog if copied within last 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          await showAltTextDialog(id, assetData);
        }
      } catch (err) {
        console.error('[PASTE ERROR]', err);
      }
    }
  }
});

async function showAltTextDialog(assetId, assetData) {
  // Extract alt text from asset data (check multiple possible fields)
  const altText = assetData?.alt_text || 
                  assetData?.description || 
                  assetData?.caption || 
                  assetData?.title || 
                  'No alt text available';
  
  // Create dialog overlay
  const overlay = document.createElement('div');
  overlay.className = 'alt-text-dialog-overlay';
  overlay.innerHTML = `
    <div class="alt-text-dialog">
      <div class="alt-text-dialog-header">
        <h3>DVIDS Image Alt Text</h3>
        <button class="alt-text-dialog-close" aria-label="Close">×</button>
      </div>
      <div class="alt-text-dialog-body">
        <p class="alt-text-label">Alt text:</p>
        <textarea class="alt-text-content" readonly>${altText}</textarea>
      </div>
      <div class="alt-text-dialog-footer">
        <button class="alt-text-copy-btn">Copy Alt Text</button>
        <button class="alt-text-close-btn">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Close handlers
  const closeDialog = () => overlay.remove();
  overlay.querySelector('.alt-text-dialog-close').addEventListener('click', closeDialog);
  overlay.querySelector('.alt-text-close-btn').addEventListener('click', closeDialog);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog();
  });
  
  // Copy button handler
  overlay.querySelector('.alt-text-copy-btn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(altText);
      const copyBtn = overlay.querySelector('.alt-text-copy-btn');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.disabled = false;
      }, 2000);
    } catch (err) {
      console.error('[COPY ALT TEXT ERROR]', err);
      setStatus(`❌ Failed to copy alt text: ${err.message}`);
    }
  });
  
  // Escape key to close
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeDialog();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

async function fetchAssetAltText(assetId) {
  try {
    const assetUrl = `${API_BASE_ASSET}?id=${encodeURIComponent(assetId)}&api_key=${API_KEY}`;
    const res = await fetch(assetUrl, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Asset API failed: ${res.status}`);
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.error('[FETCH ASSET ERROR]', err);
    throw err;
  }
}

// Initial focus
setTimeout(() => {
  els.q.focus();
  window.focus();
  console.log('[INIT] document.hasFocus=', document.hasFocus());
}, 50);
