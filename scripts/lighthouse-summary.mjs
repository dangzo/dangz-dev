import fs from 'node:fs';
import path from 'node:path';

const reportsDir = path.resolve(process.cwd(), '.tmp/lighthouse');

if (!fs.existsSync(reportsDir)) {
  console.error('No Lighthouse reports directory found at .tmp/lighthouse');
  console.error('Run "yarn lighthouse" first.');
  process.exit(1);
}

const reportFiles = fs
  .readdirSync(reportsDir)
  .filter((file) => file.endsWith('.report.json'))
  .map((file) => path.join(reportsDir, file));

if (!reportFiles.length) {
  console.error('No Lighthouse JSON reports found in .tmp/lighthouse');
  console.error('Run "yarn lighthouse" first.');
  process.exit(1);
}

const reports = reportFiles
  .map((filePath) => {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(raw);
      return {
        filePath,
        finalUrl: json.finalUrl,
        fetchTime: json.fetchTime,
        categories: json.categories,
      };
    } catch {
      return null;
    }
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.fetchTime).getTime() - new Date(a.fetchTime).getTime());

const byUrl = new Map();
for (const report of reports) {
  const key = report.finalUrl;
  if (!byUrl.has(key)) byUrl.set(key, []);
  byUrl.get(key).push(report);
}

const scorePercent = (score) => {
  if (typeof score !== 'number') return 'n/a';
  return `${Math.round(score * 100)}`;
};

const rows = [];
for (const [url, urlReports] of byUrl.entries()) {
  const latest = urlReports[0];
  const cats = latest.categories || {};
  rows.push({
    url,
    runs: urlReports.length,
    lastRun: latest.fetchTime,
    performance: scorePercent(cats.performance?.score),
    accessibility: scorePercent(cats.accessibility?.score),
    bestPractices: scorePercent(cats['best-practices']?.score),
    seo: scorePercent(cats.seo?.score),
  });
}

rows.sort((a, b) => a.url.localeCompare(b.url));

console.log('\nLighthouse Local Summary (latest run per URL)\n');
console.table(rows, [
  'url',
  'runs',
  'lastRun',
  'performance',
  'accessibility',
  'bestPractices',
  'seo',
]);
