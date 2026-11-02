const path = require("path");
const { shouldHideInProduction } = require("./lib/post-visibility");
const { isSupersededDuplicate, prepareN8nPosts } = require("./lib/n8n-posts");
const loadLegacyPosts = require("./_data/legacyPosts");

const SITE_URL = "https://provizionoutsourcing.com";

// The article workflow can publish the same title more than once; keep the newest post per slug
const duplicateGroups = prepareN8nPosts(path.join(__dirname, "content", "posts"));
if (duplicateGroups.length > 0) {
  console.log(`[n8n] Resolved ${duplicateGroups.length} duplicate slug group(s); keeping the newest post for each slug.`);
}

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Vercel serves pages without ".html" (cleanUrls), so canonical and feed links drop it
const cleanUrl = (url = "") => String(url).replace(/\/index\.html$/, "/").replace(/\.html$/, "");

module.exports = function (eleventyConfig) {
  // The hand-built pages and the six original articles are plain HTML and are copied as they are
  eleventyConfig.addPassthroughCopy("*.html");
  eleventyConfig.addPassthroughCopy("blog/*.html");
  for (const p of ["assets", "images", "favicon.ico", "apple-touch-icon.png", "robots.txt", "llms.txt", "admin"]) {
    eleventyConfig.addPassthroughCopy(p);
  }
  eleventyConfig.addPassthroughCopy({ "content/media": "media" });
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("IMAGE-SHOT-LIST.md");

  eleventyConfig.addFilter("cleanUrl", cleanUrl);

  eleventyConfig.addFilter("rangeFromOne", (end) => {
    const n = Math.max(1, Math.floor(Number(end)));
    return Array.from({ length: n }, (_, i) => i + 1);
  });

  eleventyConfig.addFilter("blogPageCount", (postCount, pageSize) => {
    const count = Number(postCount);
    const size = Number(pageSize) || 12;
    return Math.max(1, Math.ceil(count / size));
  });

  eleventyConfig.addFilter("atomDate", (value) => (toDate(value) || new Date(0)).toISOString());

  eleventyConfig.addFilter("isoDate", (value) => {
    const date = toDate(value);
    return date ? date.toISOString().slice(0, 10) : "";
  });

  eleventyConfig.addFilter("postDate", (value) => {
    const date = toDate(value);
    if (!date) return "";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  });

  eleventyConfig.addFilter("relatedPosts", (posts = [], url, count = 4) =>
    posts.filter((post) => post.url !== url).slice(0, count)
  );

  // JSON-LD for blog pages: organization, breadcrumbs, and a BlogPosting on articles
  eleventyConfig.addFilter("blogSchema", (page, title, description, image, date, isBlogPost) => {
    const org = {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "ProVizion Outsourcing",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/assets/icon-512.png`,
    };
    const crumbs = [
      { name: "Home", item: `${SITE_URL}/` },
      { name: "Blog", item: `${SITE_URL}/blog` },
    ];
    const graph = [org];

    if (isBlogPost) {
      const url = `${SITE_URL}${cleanUrl(page.url)}`;
      const published = toDate(date);
      crumbs.push({ name: title, item: url });
      graph.push({
        "@type": "BlogPosting",
        headline: title,
        description,
        url,
        mainEntityOfPage: url,
        ...(image ? { image: `${SITE_URL}${image}` } : {}),
        ...(published ? { datePublished: published.toISOString(), dateModified: published.toISOString() } : {}),
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
      });
    }

    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, ...c })),
    });

    // Escape "<" so an article title can never close the script tag
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\u003c");
  });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("content/posts/*.md")
      .filter(
        (post) =>
          !isSupersededDuplicate(post.inputPath) &&
          !shouldHideInProduction({
            date: post.date,
            draft: post.data?.draft,
          })
      )
      .sort((a, b) => b.date - a.date)
  );

  // Everything the blog page lists: workflow posts plus the hand-written articles in blog/
  eleventyConfig.addCollection("blogList", (collectionApi) => {
    const legacyPosts = loadLegacyPosts();
    const posts = collectionApi
      .getFilteredByGlob("content/posts/*.md")
      .filter((post) => !isSupersededDuplicate(post.inputPath) && !shouldHideInProduction({ date: post.date, draft: post.data?.draft }));
    return [...posts, ...legacyPosts].sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    // Generated articles are plain markdown/HTML; don't let a stray "{{" in one break the build
    markdownTemplateEngine: false,
    templateFormats: ["md", "njk"],
  };
};
