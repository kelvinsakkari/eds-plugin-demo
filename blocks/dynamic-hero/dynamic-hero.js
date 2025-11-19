async function fetchFeaturedArticle() {
  try {
    const response = await fetch('/news/query-index.json');
    if (!response.ok) throw new Error(`Failed to fetch articles: ${response.status}`);

    const data = await response.json();

    // Filter for articles with feature='true' and sort by releaseDate (most recent first)
    const featuredArticles = data.data
      .filter((article) => article.feature === 'true')
      .sort((a, b) => parseInt(b.releaseDate, 10) - parseInt(a.releaseDate, 10));

    if (featuredArticles.length === 0) {
      throw new Error('No featured articles found');
    }

    return featuredArticles[0]; // Return the most recent featured article
  } catch (error) {
    return null;
  }
}

function buildHeroContent(article) {
  // Create the hero structure matching the hero block CSS
  const heroHTML = `
    <picture>
      <source type="image/webp" srcset="${article.image}&format=webply&optimize=medium" media="(min-width: 600px)">
      <source type="image/webp" srcset="${article.image}&format=webply&optimize=medium">
      <source type="image/jpeg" srcset="${article.image}&format=pjpg&optimize=medium" media="(min-width: 600px)">
      <img loading="eager" alt="${article.title}" src="${article.image}&format=pjpg&optimize=medium" width="2000" height="1000">
    </picture>
    <div class="dynamic-hero-content">
      <h1>${article.title}</h1>
      <p>${article.description}</p>
      ${article.path ? `<p class="button-container"><a href="${article.path}" class="button primary">Read More</a></p>` : ''}
    </div>
  `;

  return heroHTML;
}

export default async function decorate(block) {
  // Fetch the most recent featured article
  const article = await fetchFeaturedArticle();

  if (!article) {
    block.innerHTML = '<p>No featured article available</p>';
    return;
  }

  // Build and inject the hero content
  block.innerHTML = buildHeroContent(article);
}
