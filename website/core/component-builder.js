/**
 * ============================================================
 * Component Builder
 * ============================================================
 *
 * Generates reusable HTML components.
 *
 * Every visual "piece" of Atlas should eventually
 * live here.
 */

export default class ComponentBuilder {

    //--------------------------------------------------
    // Generic Card
    //--------------------------------------------------

    getUrl(object) {
        const type = object.metadata?.type || "article";
        const id = object.metadata?.id || object.slug || "unknown";
        if (type === "shit-list") return `/shit-list/${id}.html`;
        if (type === "wishlist")  return `/wishlist/#${id}`;
        if (type === "tv-show")   return `/tv-shows/${id}.html`;
        const libraryTypes = ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music"];
        if (libraryTypes.includes(type)) {
            return `/library/${type}s/${id}.html`;
        }
        return `/${type}s/${id}.html`;
    }

    card(object, cssClass = "") {

        return `
<article class="card ${cssClass}">

    <h2>

        <a href="${this.getUrl(object)}">

            ${object.metadata?.title || object.title || "Untitled"}

        </a>

    </h2>

    <p>

        ${object.metadata?.summary ?? ""}

    </p>

</article>
`;

    }

    //--------------------------------------------------
    // Content Cards
    //--------------------------------------------------

    articleCard(article) {

        return this.card(article, "article-card");

    }

    projectCard(project) {

        return this.card(project, "project-card");

    }

    topicCard(topic) {

        return this.card(topic, "topic-card");

    }

    themeCard(theme) {

        return this.card(theme, "theme-card");

    }

    collectionCard(collection) {

        return this.card(collection, "collection-card");

    }

    softwareCard(software) {

        return this.card(software, "software-card");

    }

    hardwareCard(hardware) {

        return this.card(hardware, "hardware-card");

    }

    companyCard(company) {

        return this.card(company, "company-card");

    }

    creatorCard(creator) {

        return this.card(creator, "creator-card");

    }

    websiteCard(site) {

        return this.card(site, "website-card");

    }

    serviceCard(service) {

        return this.card(service, "service-card");

    }

    gameCard(game) {

        return this.card(game, "game-card");

    }

    bookCard(book) {

        return this.card(book, "book-card");

    }

    courseCard(course) {

        return this.card(course, "course-card");

    }

    //--------------------------------------------------
    // Lists
    //--------------------------------------------------

    unorderedList(items = []) {

        if (!items.length) {

            return "<p><em>None</em></p>";

        }

        return `

<ul>

${items.map(item => `<li>${item}</li>`).join("\n")}

</ul>

`;

    }

    //--------------------------------------------------
    // Metadata
    //--------------------------------------------------

    metadata(object) {

        return `

<div class="metadata">

<p><strong>Type:</strong> ${object.metadata.type}</p>

<p><strong>Status:</strong> ${object.metadata.status}</p>

</div>

`;

    }

    //--------------------------------------------------
    // Breadcrumbs
    //--------------------------------------------------

    breadcrumbs(object) {

        return `

<nav class="breadcrumbs">

<a href="/">Home</a>

/

<a href="/${object.metadata.type}s/">

${object.metadata.type}

</a>

/

<span>${object.metadata.title}</span>

</nav>

`;

    }

    statistics(stats) {

        return `
<div class="stats-grid">
    <a href="/articles/" class="stat-card">
        <span class="stat-number">${stats.articles || 0}</span>
        <span class="stat-label">Articles</span>
    </a>
    <a href="/projects/" class="stat-card">
        <span class="stat-number">${stats.projects || 0}</span>
        <span class="stat-label">Projects</span>
    </a>
    <a href="/topics/" class="stat-card">
        <span class="stat-number">${stats.topics || 0}</span>
        <span class="stat-label">Topics</span>
    </a>
    <a href="/themes/" class="stat-card">
        <span class="stat-number">${stats.themes || 0}</span>
        <span class="stat-label">Themes</span>
    </a>
    <a href="/" onclick="document.getElementById('search-trigger')?.click(); return false;" class="stat-card">
        <span class="stat-number">${stats.total || 0}</span>
        <span class="stat-label">Total Objects</span>
    </a>
</div>
`;

    }

    feed(feed) {

        if (!feed || feed.length === 0) {
            return `<p class="empty-feed">No recent activity logged.</p>`;
        }

        const items = feed.slice(0, 8).map(item => `
<div class="activity-item">
    <div class="activity-icon">📌</div>
    <div class="activity-content">
        <a href="${item.url}" class="activity-title">${this.escapeHtml(item.title || item.id)}</a>
        <span class="activity-type-badge">${this.escapeHtml(item.type || 'object')}</span>
        ${item.summary ? `<p class="activity-summary">${this.escapeHtml(item.summary.slice(0, 100))}${item.summary.length > 100 ? '...' : ''}</p>` : ''}
    </div>
</div>
`).join("\n");

        return `<div class="activity-feed">${items}</div>`;

    }

    twitterFeed(tweets = []) {
        const cards = tweets.map(tweet => {
            const m = tweet.metadata || {};
            const topics = (m.topics || []).map(t => `<a href="/topics/${t}.html" class="tweet-topic-pill">#${t}</a>`).join(" ");
            const themes = (m.themes || []).map(th => `<a href="/themes/${th}.html" class="tweet-theme-pill">${th}</a>`).join(" ");
            
            const statusUrl = m.status_url || `https://x.com/ThomsFoolery`;
            return `
        <article class="x-tweet-card">
            <div class="tweet-meta">
                <span class="tweet-author">${this.escapeHtml(m.author || '@ThomsFoolery')}</span>
                <div class="tweet-badges">${topics} ${themes}</div>
            </div>
            <a href="${statusUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; color:inherit;"><p class="tweet-body" style="cursor:pointer;">${this.escapeHtml(tweet.body || m.summary || '')}</p></a>
            <div class="tweet-footer">
                <div class="tweet-stats">
                    <span title="Likes">❤️ ${m.favorites || 0}</span>
                    <span title="Retweets" style="margin-left: 10px;">🔁 ${m.retweets || 0}</span>
                </div>
                <div style="flex-grow: 1;"></div>
                <a href="${statusUrl}" target="_blank" rel="noopener noreferrer" class="tweet-link">View Thread on 𝕏 &rarr;</a>
                <a href="/tweets/${m.id}.html" class="tweet-atlas-link">Explore Connected Node &rarr;</a>
            </div>
        </article>
            `;
        }).join("\n");

        return `
<section class="x-feed-section" aria-label="Jonathan Thoms on X">
    <div class="x-feed-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div class="x-profile-info">
            <span class="x-icon">𝕏</span>
            <div>
                <h3>Jonathan Thoms (@ThomsFoolery)</h3>
                <p>Extracted 𝕏 threads & posts connected directly to Project Atlas topics and themes. <a href="/tweets/index.html">View all tweets &rarr;</a></p>
            </div>
        </div>
        <a href="https://x.com/ThomsFoolery" target="_blank" rel="noopener noreferrer" class="btn-x-follow">Follow @ThomsFoolery</a>
    </div>

    <div class="x-feed-grid">
        ${cards}
    </div>
</section>
        `;
    }

    escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

}

