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

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = fullImageUrl;
      await img.decode();
      console.log('[IMAGE LOADED]', fullImageUrl, img.naturalWidth, img.naturalHeight);

      // Resize if image is too large (max 4096px on longest side to stay under clipboard limits)
      const MAX_DIMENSION = 4096;
      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;
      
      if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / targetWidth, MAX_DIMENSION / targetHeight);
        targetWidth = Math.floor(targetWidth * ratio);
        targetHeight = Math.floor(targetHeight * ratio);
        console.log('[RESIZE]', `${img.naturalWidth}x${img.naturalHeight} → ${targetWidth}x${targetHeight}`);
        setStatus(`Resizing image to ${targetWidth}x${targetHeight}...`);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Try PNG first, fall back to JPEG if too large
      let blobType = 'image/png';
      let blob = await new Promise(resolve => canvas.toBlob(resolve, blobType));
      
      console.log('[BLOB CREATED]', `${(blob.size / 1024 / 1024).toFixed(2)} MB`, blob.type);
      
      // If PNG is too large (> 3 MB), try JPEG with high quality
      const MAX_BLOB_SIZE = 3 * 1024 * 1024; // 3 MB
      if (blob.size > MAX_BLOB_SIZE) {
        console.log('[BLOB TOO LARGE] Converting to JPEG...');
        setStatus('Image too large, compressing...');
        blobType = 'image/jpeg';
        blob = await new Promise(resolve => canvas.toBlob(resolve, blobType, 0.92));
        console.log('[JPEG BLOB]', `${(blob.size / 1024 / 1024).toFixed(2)} MB`);
      }

      try {
        await navigator.clipboard.write([new ClipboardItem({ [blobType]: blob })]);
        console.log('[CLIPBOARD WRITE SUCCESS]', `${(blob.size / 1024 / 1024).toFixed(2)} MB written`);
        setStatus(`✅ Image copied (${targetWidth}x${targetHeight}, ${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
        showCopiedOverlay(card);
      } catch (err) {
        console.error('[CLIPBOARD WRITE ERROR]', err);
        setStatus(`❌ Copy failed: ${err.message}`);
      }
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

// Initial focus
setTimeout(() => {
  els.q.focus();
  window.focus();
  console.log('[INIT] document.hasFocus=', document.hasFocus());
}, 50);
