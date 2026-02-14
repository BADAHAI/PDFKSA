const pages = [
  "index.html",
  "tools.html",
  "about.html",
  "privacy.html"
];

const base = "https://badahai.github.io/PDFKSA/";

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

pages.forEach(page => {
  xml += `  <url>\n`;
  xml += `    <loc>${base}${page}</loc>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `  </url>\n`;
});

xml += `</urlset>`;

document.write(xml);
