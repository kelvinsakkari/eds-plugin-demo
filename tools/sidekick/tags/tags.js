async function loadTags() {
  try {
    const resp = await fetch('https://main--military--jfoxx.aem.live/admin/tags.json?sheet=topics');
    const data = await resp.json();

    const container = document.getElementById('tag-list');
    container.innerHTML = '';

    // Use both title (for display) and name (for value)
    const tags = data.data.map(t => ({ title: t.title, name: t.name }));

    tags.forEach(tag => {
      const label = document.createElement('label');
      label.className = 'tag-item';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = tag.name; // copy the name value

      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + tag.title)); // display the title
      container.appendChild(label);
    });
  } catch (err) {
    console.error('Error loading tags:', err);
    document.getElementById('tag-list').textContent = 'Failed to load tags.';
  }
}

document.getElementById('copy-btn').addEventListener('click', () => {
  const selected = [...document.querySelectorAll('#tag-list input[type=checkbox]:checked')]
    .map(cb => cb.value) // this will now be the "name" values
    .join(',');

  if (selected) {
    navigator.clipboard.writeText(selected);

    // Reset all checkboxes so palette starts fresh next time
    document.querySelectorAll('#tag-list input[type=checkbox]').forEach(cb => cb.checked = false);

    // Close the palette properly
    chrome.runtime.sendMessage('igkmdomcgoebiipaifhmpfjhbjccggml', {
      id: 'tags',
      action: 'closePalette',
    });
  }
});

// Load tags on page load
loadTags();
