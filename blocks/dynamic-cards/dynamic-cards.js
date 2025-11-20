import { fetchNewsArticles, buildArticleImage, getDisplayedArticlePaths } from '../../scripts/news-data.js';

function createArticleCard(article) {
  const li = document.createElement('li');

  const imageDiv = document.createElement('div');
  imageDiv.classList.add('cards-card-image');
  imageDiv.innerHTML = buildArticleImage(article.image, article.title);

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('cards-card-body');

  const title = document.createElement('h3');
  title.textContent = article.title;

  const description = document.createElement('p');
  description.textContent = article.description;

  bodyDiv.appendChild(title);
  bodyDiv.appendChild(description);

  if (article.path) {
    const link = document.createElement('p');
    link.classList.add('button-container');
    const anchor = document.createElement('a');
    anchor.href = article.path;
    anchor.textContent = 'Read More';
    anchor.classList.add('button', 'primary');
    link.appendChild(anchor);
    bodyDiv.appendChild(link);
  }

  li.appendChild(imageDiv);
  li.appendChild(bodyDiv);

  return li;
}

/**
 * Reads configuration from block cells
 * Expected format:
 * | limit | 6 |
 * | featured | true |
 * | category | news |
 */
function readBlockConfig(block) {
  const config = {
    limit: 6,
    featured: false,
    sortBy: 'releaseDate',
  };

  const rows = block.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();

      if (key === 'limit') {
        config.limit = parseInt(value, 10);
      } else if (key === 'featured') {
        config.featured = value.toLowerCase() === 'true';
      } else if (key === 'category') {
        config.category = value;
      } else if (key === 'tag') {
        config.tag = value;
      }
    }
  });

  return config;
}

export default async function decorate(block) {
  // Read configuration from block
  const config = readBlockConfig(block);

  // Get already displayed article paths to avoid duplication
  const excludePaths = getDisplayedArticlePaths(block);
  if (excludePaths.length > 0) {
    config.excludePaths = excludePaths;
  }

  // Clear the block
  block.innerHTML = '';

  // Fetch articles (will exclude already displayed articles)
  const articles = await fetchNewsArticles(config);

  if (!articles || articles.length === 0) {
    block.innerHTML = '<p>No articles available</p>';
    return;
  }

  // Create the cards list
  const ul = document.createElement('ul');

  articles.forEach((article) => {
    const card = createArticleCard(article);
    ul.appendChild(card);
  });

  block.appendChild(ul);
}
