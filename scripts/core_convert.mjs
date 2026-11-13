// The Node arm of the converter page's parity check: converts each listed file with '@page2ai/core/html'
// (the same package the page bundles, from this repo's node_modules) and the options the page uses.
// Usage: node scripts/core_convert.mjs <jobs.json> <out.json>
//   jobs.json: [{ "file": "<path>", "baseUrl": "<url or empty>" }, ...]
// Each file is decoded as UTF-8 by TextDecoder, as the page does for a file without another charset.
import { readFileSync, writeFileSync } from 'node:fs';
import { htmlToMarkdown } from '@page2ai/core/html';

const [jobsFile, outFile] = process.argv.slice(2);
const jobs = JSON.parse(readFileSync(jobsFile, 'utf8'));
const out = {};
for (const { file, baseUrl } of jobs) {
  const html = new TextDecoder('utf-8').decode(readFileSync(file));
  const r = htmlToMarkdown(html, { ...(baseUrl ? { baseUrl } : {}), includeFrontmatter: true, includeImages: true });
  out[file] = r.markdown;
}
writeFileSync(outFile, JSON.stringify(out));
console.log(`${jobs.length} files converted in Node`);
