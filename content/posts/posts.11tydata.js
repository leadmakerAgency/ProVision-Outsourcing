const fs = require("fs");
const path = require("path");
const { shouldHideInProduction } = require("../../lib/post-visibility");
const { getExecutionId, isSupersededDuplicate, resolveFeaturedImage } = require("../../lib/n8n-posts");

const BLOG_DIR = path.join(__dirname, "..", "..", "blog");

module.exports = {
  isBlogPost: true,
  eleventyComputed: {
    layout: (data) => data.layout || "blog-post.njk",
    featured_image: (data) => resolveFeaturedImage(data),
    metaTitle: (data) => `${data.title} | ProVizion Outsourcing`,
    metaDescription: (data) => data.excerpt || data.title,
    eleventyExcludeFromCollections: (data) => {
      if (isSupersededDuplicate(data.page?.inputPath)) {
        return true;
      }

      if (shouldHideInProduction(data)) {
        return true;
      }

      return data.eleventyExcludeFromCollections;
    },
    permalink: (data) => {
      if (isSupersededDuplicate(data.page?.inputPath)) {
        return false;
      }

      if (shouldHideInProduction(data)) {
        return false;
      }

      const rawSlug = data.slug || data.page?.fileSlug || "";
      let slug =
        String(rawSlug)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || data.page.fileSlug;

      // Never overwrite one of the hand-written articles in blog/
      if (fs.existsSync(path.join(BLOG_DIR, `${slug}.html`))) {
        slug = `${slug}-${getExecutionId(data.page.fileSlug) || "new"}`;
      }

      // Served without ".html" on Vercel, like the existing articles
      return `/blog/${slug}.html`;
    },
  },
};
