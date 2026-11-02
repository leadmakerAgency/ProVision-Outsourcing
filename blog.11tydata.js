module.exports = {
  layout: "base.njk",
  title: "Outsourcing Insights",
  eleventyExcludeFromCollections: true,
  pagination: {
    data: "collections.blogList",
    size: 12,
    alias: "pagedPosts",
    before: (paginationData) =>
      paginationData && paginationData.length > 0 ? paginationData : [null],
  },
  eleventyComputed: {
    metaTitle: (data) => {
      const n = data.pagination?.pageNumber ?? 0;
      return `Blog${n > 0 ? ` - Page ${n + 1}` : ""} | ProVizion Outsourcing`;
    },
    metaDescription: () =>
      "Guides, comparisons and honest answers on outsourcing to the Philippines from the ProVizion Outsourcing team.",
  },
  permalink(data) {
    const pageNumber = data.pagination?.pageNumber ?? 0;
    return pageNumber === 0 ? "/blog.html" : `/blog/page/${pageNumber + 1}.html`;
  },
};
