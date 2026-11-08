import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getFirstStory } from '../js/first-story.js';
const root = resolve(import.meta.dirname, '..');
const story = getFirstStory('ko');
const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const html = story.scenes.map((scene, index) => `<section class="journey-scene${index === 0 ? ' is-opening' : ''}${index === story.scenes.length - 1 ? ' is-ending' : ''}" id="${scene.id}" data-scene="${index}" tabindex="-1"><div class="journey-copy"><p class="journey-kicker"><span class="scene-number">N-001</span>${esc(scene.eyebrow)}</p><${index === 0 ? 'h1' : 'h2'}>${esc(scene.title)}</${index === 0 ? 'h1' : 'h2'}><div class="journey-paragraphs">${scene.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}</div>${index === 0 ? `<p class="journey-side-note">${esc(story.title)}</p><a class="journey-start" href="#nebula">${esc(story.ui.scrollCue)} ↓</a>` : ''}${index === story.scenes.length - 1 ? `<div class="journey-ending-links"><a class="journey-home" href="./">${esc(story.ui.home)} ↗</a></div>` : ''}</div></section>`).join('\n    ');
for (const file of ['first.html', 'first-app.html']) {
  const path = resolve(root, file);
  let source = readFileSync(path, 'utf8');
  source = source.replace(/(<main id="journey-story" tabindex="-1">)[\s\S]*?(<\/main>)/, `$1\n    ${html}\n  $2`);
  source = source.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${esc(story.summary)}" />`);
  source = source.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${esc(story.subtitle)}" />`);
  source = source.replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${esc(story.subtitle)}" />`);
  if (!source.includes(`id="${story.scenes[0].id}"`) || !source.includes(`id="${story.scenes.at(-1).id}"`)) throw new Error(`Narrative missing from ${file}`);
  writeFileSync(path, source);
}
console.log(`First exhibition: ${story.scenes.length} passages prerendered into both device entries.`);
