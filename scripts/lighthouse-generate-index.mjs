import fs from 'node:fs';
import path from 'node:path';

const reportsDir = path.resolve(process.cwd(), '.tmp/lighthouse');
const outputFile = path.join(reportsDir, 'index.html');

if (!fs.existsSync(reportsDir)) {
  console.error('No Lighthouse reports directory found at .tmp/lighthouse');
  console.error('Run "yarn lighthouse" first.');
  process.exit(1);
}

const htmlFiles = fs
  .readdirSync(reportsDir)
  .filter((file) => file.endsWith('.report.html'))
  .sort((a, b) => b.localeCompare(a));

if (!htmlFiles.length) {
  console.error('No Lighthouse HTML reports found in .tmp/lighthouse');
  console.error('Run "yarn lighthouse" first.');
  process.exit(1);
}

const groups = new Map();
for (const fileName of htmlFiles) {
  const route = fileName.includes('-about-')
    ? '/about'
    : fileName.includes('-blog-')
      ? '/blog'
      : '/';

  if (!groups.has(route)) groups.set(route, []);
  groups.get(route).push(fileName);
}

const groupSections = Array.from(groups.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([route, files]) => {
    const items = files
      .map((fileName) => `<li><a href="./${fileName}">${fileName}</a></li>`)
      .join('\n');

    return `<section><h2>${route}</h2><ul>${items}</ul></section>`;
  })
  .join('\n');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Lighthouse Local Reports</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 1000px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
      h1 { margin-bottom: 0.25rem; }
      .meta { color: #555; margin-bottom: 1.5rem; }
      section { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
      h2 { margin-top: 0; }
      ul { margin: 0; padding-left: 1.25rem; }
      a { color: #0b61a4; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>Lighthouse Local Reports</h1>
    <p class="meta">Generated: ${new Date().toISOString()}</p>
    ${groupSections}
  </body>
</html>`;

fs.writeFileSync(outputFile, html);
console.log(`Created ${outputFile}`);
