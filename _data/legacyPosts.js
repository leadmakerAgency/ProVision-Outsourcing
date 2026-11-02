// The hand-written articles in blog/*.html, read so the blog page can list them with the workflow posts
const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "..", "blog");

const decode = (s = "") =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

module.exports = () => {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".html")).sort();

  return files.map((file, index) => {
    const html = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const pick = (re) => (html.match(re) || [])[1] || "";
    const updated = pick(/class="blogmeta">[^<]*?Updated ([A-Za-z]+ \d{4})/);
    const date = new Date(updated ? `1 ${updated} UTC` : "2026-09-01T00:00:00Z");
    // Same month for all of them: keep alphabetical order by spacing them a minute apart
    date.setUTCMinutes(files.length - index);

    return {
      url: `/blog/${file}`,
      date,
      data: {
        title: decode(pick(/<h1>([^<]*)<\/h1>/)),
        // These pages only say "Updated September 2026", so show the month rather than a made-up day
        dateLabel: updated,
        excerpt: decode(pick(/<meta name="description" content="([^"]*)"/)),
        featured_image: pick(/class="heroimg"><img src="([^"]*)"/).replace(/^\.\.\//, "/"),
      },
    };
  });
};
