// One-off / maintenance: re-derive the LibriVox links for every work from the
// live LibriVox catalogue using the shared strict matcher, replacing the stale
// links that an earlier loose matcher had spammed across unrelated works.
// Non-LibriVox links (Gutenberg, Internet Archive, manual) are left untouched.
//
// Run `DRY=1 node scripts/cleanup-librivox.mjs` first to preview counts.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isMatch } from './lib/match.mjs';

const DATA_DIR = join(import.meta.dirname, '..', 'data');
const LINKS_DIR = join(DATA_DIR, 'links');
const WORKS_DIR = join(DATA_DIR, 'works');
const AUTHORS_DIR = join(DATA_DIR, 'authors');
const DRY = !!process.env.DRY;

const readJson = (p) => JSON.parse(readFileSync(p, 'utf-8'));
const writeJson = (p, d) => writeFileSync(p, `${JSON.stringify(d, null, '\t')}\n`);

const authors = new Map();
for (const file of readdirSync(AUTHORS_DIR)) {
	if (!file.endsWith('.json')) continue;
	const a = readJson(join(AUTHORS_DIR, file));
	authors.set(a.id, a);
}

const works = readdirSync(WORKS_DIR)
	.filter((f) => f.endsWith('.json'))
	.map((f) => readJson(join(WORKS_DIR, f)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const lvCache = new Map();
// Returns null when the catalogue could not be fetched (so callers can skip
// rather than mistake a failed request for "this author has no audiobooks" and
// wipe legitimate links). Returns an array (possibly empty) on success.
async function getLibriVoxBooks(authorName) {
	if (lvCache.has(authorName)) return lvCache.get(authorName);
	const lastName = authorName.split(' ').pop();
	const params = new URLSearchParams({ author: lastName, format: 'json', extended: '1' });
	const url = `https://librivox.org/api/feed/audiobooks/?${params}`;

	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			const res = await fetch(url);
			// LibriVox returns 404 with {"error":...} when an author has no books.
			if (res.ok) {
				const data = await res.json();
				const firstName = authorName.split(' ')[0].toLowerCase();
				const books = (data.books || []).filter((b) =>
					(b.authors || [])
						.map((a) => `${a.first_name} ${a.last_name}`.trim().toLowerCase())
						.some((a) => a.includes(firstName) && a.includes(lastName.toLowerCase())),
				);
				lvCache.set(authorName, books);
				return books;
			}
			if (res.status === 404) {
				lvCache.set(authorName, []);
				return [];
			}
		} catch {
			// fall through to retry
		}
		await sleep(1000 * (attempt + 1));
	}
	lvCache.set(authorName, null);
	return null;
}

function matchedBooks(work, books) {
	return books.filter(
		(b) => isMatch(work, b.title) || (b.sections || []).some((s) => isMatch(work, s.title)),
	);
}

let filesChanged = 0;
let linksRemoved = 0;
let linksKept = 0;
let skipped = 0;

for (const work of works) {
	const linksPath = join(LINKS_DIR, `${work.slug}.json`);
	if (!existsSync(linksPath)) continue;
	const existing = readJson(linksPath);
	if (!Array.isArray(existing)) continue;

	const oldLv = existing.filter((l) => l.source === 'LibriVox');
	if (oldLv.length === 0) continue;

	const author = authors.get(work.author_id);
	const books = author ? await getLibriVoxBooks(author.name) : null;

	// Fail safe: a failed catalogue fetch (null) must never be treated as
	// "no matches" — that would wipe legitimate links. Leave the work untouched.
	if (books === null) {
		skipped++;
		console.log(`  ${work.slug}: SKIPPED (catalogue unavailable)`);
		continue;
	}

	const other = existing.filter((l) => l.source !== 'LibriVox');
	const newLv = matchedBooks(work, books).map((b) => ({
		source: 'LibriVox',
		format: 'Hörbuch',
		url: b.url_librivox,
		label: b.title,
		librivox_id: b.id,
	}));

	linksKept += newLv.length;
	linksRemoved += oldLv.length - newLv.length;

	const next = [...other, ...newLv];
	if (JSON.stringify(next) !== JSON.stringify(existing)) {
		filesChanged++;
		if (oldLv.length !== newLv.length) {
			console.log(`  ${work.slug}: LibriVox ${oldLv.length} → ${newLv.length}`);
		}
		if (!DRY) writeJson(linksPath, next);
	}
}

console.log(
	`\n${DRY ? '[dry-run] ' : ''}files changed: ${filesChanged}, LibriVox links kept: ${linksKept}, removed: ${linksRemoved}, skipped (fetch failed): ${skipped}`,
);
