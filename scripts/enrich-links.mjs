import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(import.meta.dirname, '..', 'data');
const LINKS_DIR = join(DATA_DIR, 'links');
const WORKS_DIR = join(DATA_DIR, 'works');
const AUTHORS_DIR = join(DATA_DIR, 'authors');

mkdirSync(LINKS_DIR, { recursive: true });

function readJson(path) {
	return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJson(path, data) {
	writeFileSync(path, `${JSON.stringify(data, null, '\t')}\n`);
}

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

const authors = new Map();
for (const file of readdirSync(AUTHORS_DIR)) {
	if (!file.endsWith('.json')) continue;
	const author = readJson(join(AUTHORS_DIR, file));
	authors.set(author.id, author);
}

const works = [];
for (const file of readdirSync(WORKS_DIR)) {
	if (!file.endsWith('.json')) continue;
	works.push(readJson(join(WORKS_DIR, file)));
}

async function searchLibriVox(title, authorName) {
	const params = new URLSearchParams({
		title: title,
		format: 'json',
		limit: '5',
	});
	const url = `https://librivox.org/api/feed/audiobooks/?${params}`;

	try {
		const res = await fetch(url);
		if (!res.ok) return [];
		const data = await res.json();
		if (!data.books) return [];

		return data.books
			.filter((b) => {
				const bookAuthors = (b.authors || []).map((a) =>
					`${a.first_name} ${a.last_name}`.trim().toLowerCase(),
				);
				return bookAuthors.some((a) => a.includes(authorName.toLowerCase().split(' ').pop()));
			})
			.map((b) => ({
				source: 'LibriVox',
				format: 'Hörbuch',
				url: b.url_librivox,
				label: b.title,
			}));
	} catch {
		return [];
	}
}

async function searchGutenberg(title, authorName) {
	const lastName = authorName.split(' ').pop();
	const params = new URLSearchParams({
		search: `${title} ${lastName}`,
		languages: 'de',
	});
	const url = `https://gutendex.com/books/?${params}`;

	try {
		const res = await fetch(url);
		if (!res.ok) return [];
		const data = await res.json();
		if (!data.results) return [];

		return data.results
			.filter((b) => {
				const matchesAuthor = b.authors.some((a) =>
					a.name.toLowerCase().includes(lastName.toLowerCase()),
				);
				const matchesTitle = b.title.toLowerCase().includes(title.toLowerCase().slice(0, 10));
				return matchesAuthor && matchesTitle;
			})
			.slice(0, 1)
			.map((b) => ({
				source: 'Project Gutenberg',
				format: 'E-Book',
				url: `https://www.gutenberg.org/ebooks/${b.id}`,
				label: b.title,
			}));
	} catch {
		return [];
	}
}

async function main() {
	let updated = 0;
	let skipped = 0;

	for (const work of works) {
		const linksPath = join(LINKS_DIR, `${work.slug}.json`);
		const existing = existsSync(linksPath) ? readJson(linksPath) : [];
		const existingSources = new Set(existing.map((l) => l.source));

		const author = authors.get(work.author_id);
		if (!author) {
			console.log(`  Skipping "${work.title}" — unknown author ${work.author_id}`);
			continue;
		}

		const newLinks = [...existing];

		if (!existingSources.has('LibriVox')) {
			const lv = await searchLibriVox(work.title, author.name);
			if (lv.length > 0) {
				newLinks.push(lv[0]);
				console.log(`  + LibriVox: "${work.title}"`);
			}
			await sleep(500);
		}

		if (!existingSources.has('Project Gutenberg')) {
			const pg = await searchGutenberg(work.title, author.name);
			if (pg.length > 0) {
				newLinks.push(pg[0]);
				console.log(`  + Gutenberg: "${work.title}"`);
			}
			await sleep(300);
		}

		if (newLinks.length > existing.length) {
			writeJson(linksPath, newLinks);
			updated++;
		} else {
			skipped++;
		}
	}

	console.log(`\nDone: ${updated} updated, ${skipped} unchanged`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
