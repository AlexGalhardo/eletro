/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://example.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ["/api/*"],
  changefreq: "weekly",
  priority: 0.7,
};
