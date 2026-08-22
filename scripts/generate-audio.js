#!/usr/bin/env node
// Generates (or regenerates, if the text changed) the Listen feature's narration for every post
// that opts in — frontmatter `listen: true`, and only while site.listenEnabled is also on (see
// components/share.liquid) — one post at a time. Deliberately a separate step from `npm run dev`/
// `npm run build`: Piper's high-quality model takes real minutes per post, so doing this inline in
// the Eleventy build would block the dev server (and every build) behind narrating the whole
// opted-in catalog first. Run this after a build (`npm run build` or `npm run dev`) — it reads
// already-rendered post HTML from _site/ to know which posts opted in. Output goes straight to
// src/assets/audio/ (git-tracked, passthrough-copied — see lib/audio.js), so commit the result
// alongside your post changes. Safe to re-run any time: posts with unchanged text and existing
// audio are skipped.
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { extractPostContent } from '../lib/markdownExport.js';
import { getCachedAudioPath, generateAudio } from '../lib/audio.js';
import { dir } from '../lib/constants.js';

const postsDir = join(dir.output, 'blog');

if (!existsSync(postsDir)) {
  console.error(`${postsDir} doesn't exist yet — run \`npm run build\` (or start \`npm run dev\`) first.`);
  process.exit(1);
}

// _site/blog/ also holds pagination directories (2/, 3/, ...) alongside real posts — both are
// plain directories, so distinguishing them requires actually checking each page's content, the
// same way the Eleventy transforms this mirrors do (`class="wrapper post"`). Whether a post opted
// into narration is likewise read straight off its rendered HTML: components/share.liquid only
// emits #listen-button when both site.listenEnabled and that post's own `listen: true` are set, so
// its presence *is* the opt-in signal — no separate frontmatter parsing needed.
const entries = await readdir(postsDir, { withFileTypes: true });
const candidates = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

const posts = [];
for (const slug of candidates) {
  const htmlPath = join(postsDir, slug, 'index.html');
  if (!existsSync(htmlPath)) {
    continue;
  }
  const html = await readFile(htmlPath, 'utf8');
  if (html.includes('class="wrapper post"') && html.includes('id="listen-button"')) {
    posts.push({ slug, html });
  }
}

console.log(`Found ${posts.length} posts with Listen enabled.`);

let generated = 0;
let skipped = 0;

for (const [index, { slug, html }] of posts.entries()) {
  const { title, proseHtml } = extractPostContent(html);

  if (getCachedAudioPath({ slug, title, proseHtml })) {
    skipped += 1;
    continue;
  }

  const startedAt = Date.now();
  console.log(`[${index + 1}/${posts.length}] Generating "${slug}"...`);
  await generateAudio({ slug, title, proseHtml });
  console.log(`  done in ${Math.round((Date.now() - startedAt) / 1000)}s`);
  generated += 1;
}

console.log(`Done. Generated ${generated}, reused ${skipped} already up to date.`);
