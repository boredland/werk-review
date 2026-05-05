import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(import.meta.dirname, '..', 'data');
const LINKS_DIR = join(DATA_DIR, 'links');
const WORKS_DIR = join(DATA_DIR, 'works');
const AUTHORS_DIR = join(DATA_DIR, 'authors');
const CONCURRENCY = Number(process.env.CONCURRENCY) || 5;

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

async function pMap(items, mapper, concurrency) {
	const results = [];
	const iterator = items.entries();
	async function worker() {
		for (const [index, item] of iterator) {
			results[index] = await mapper(item);
		}
	}
	await Promise.all(Array.from({ length: Math.min(items.length, concurrency) }, worker));
	return results;
}

function normalize(str) {
	if (!str) return '';
	return str
		.toLowerCase()
		.replace(/ß/g, 'ss')
		.replace(/mmm/g, 'mm')
		.replace(/nnn/g, 'nn')
		.replace(/[^a-z0-9]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function isMatch(work, lvTitle) {
	const nLv = normalize(lvTitle);
	const titles = [work.title, ...(work.aliases || [])];

	for (const t of titles) {
		const nWork = normalize(t);
		if (nWork === nLv) return true;
		if (nWork.length > 5 && (nLv.includes(nWork) || nWork.includes(nLv))) return true;

		// Simple fuzzy: remove common prefixes/suffixes
		const simplify = (s) =>
			s
				.replace(/^(die|der|das|ein|eine|auswahl aus|erzaehlungen aus|novellen) /g, '')
				.replace(/ teil i+$/g, '')
				.replace(/ \d+$/g, '')
				.trim();

		const sWork = simplify(nWork);
		const sLv = simplify(nLv);

		if (sWork.length > 3 && (sWork === sLv || sLv.includes(sWork) || sWork.includes(sLv)))
			return true;
	}
	return false;
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

const librivoxCache = new Map();

async function getLibriVoxBooks(authorName) {
	if (librivoxCache.has(authorName)) return librivoxCache.get(authorName);

	const lastName = authorName.split(' ').pop();
	const params = new URLSearchParams({
		author: lastName,
		format: 'json',
		extended: '1',
	});
	const url = `https://librivox.org/api/feed/audiobooks/?${params}`;

	try {
		const res = await fetch(url);
		if (!res.ok) return [];
		const data = await res.json();
		if (!data.books) return [];

		const firstName = authorName.split(' ')[0].toLowerCase();
		const filtered = data.books.filter((b) => {
			const bookAuthors = (b.authors || []).map((a) =>
				`${a.first_name} ${a.last_name}`.trim().toLowerCase(),
			);
			return bookAuthors.some((a) => a.includes(firstName) && a.includes(lastName.toLowerCase()));
		});

		librivoxCache.set(authorName, filtered);
		return filtered;
	} catch {
		return [];
	}
}

async function searchProjektGutenberg(work, authorName) {
	const titles = [work.title, ...(work.aliases || [])];
	const authorSlug = authorName.toLowerCase().replace(/ /g, '-');
	const lastName = authorName.split(' ').pop().toLowerCase();

	for (const title of titles) {
		// 1. Try to predict the URL
		const workSlug = title
			.toLowerCase()
			.replace(/ä/g, 'ae')
			.replace(/ö/g, 'oe')
			.replace(/ü/g, 'ue')
			.replace(/ß/g, 'ss')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
		
		const predictedUrl = `https://projekt-gutenberg.org/authors/${authorSlug}/books/${workSlug}`;
		try {
			const headRes = await fetch(predictedUrl, { method: 'HEAD' });
			if (headRes.ok) return [{ source: 'Projekt Gutenberg-DE', format: 'Volltext', url: predictedUrl, label: title }];
		} catch (e) {
			// Ignore network errors for prediction
		}

		// 2. Fallback to search
		const params = new URLSearchParams({ s: `${title} ${authorName}` });
		const url = `https://projekt-gutenberg.org/?${params}`;

		try {
			const res = await fetch(url);
			if (!res.ok) continue;
			const html = await res.text();

			const linkPattern = /href="(https:\/\/projekt-gutenberg\.org\/authors\/[^"]*\/books\/[^"]*)"/g;
			const matches = [...new Set([...html.matchAll(linkPattern)].map((m) => m[1]))];
			if (matches.length === 0) continue;

			const nWork = normalize(title);
			const match = matches.find((m) => {
				const urlLower = m.toLowerCase();
				if (!urlLower.includes(lastName)) return false;

				const slug = urlLower.split('/').filter(Boolean).pop();
				const nSlug = slug.replace(/-/g, ' ');
				
				// Direct match or inclusion
				if (nSlug.includes(nWork) || nWork.includes(nSlug)) return true;
				
				// Fuzzy match words
				const workWords = nWork.split(' ').filter(w => w.length > 3);
				const slugWords = nSlug.split(' ').filter(w => w.length > 3);
				const common = workWords.filter(w => slugWords.includes(w));
				return common.length >= Math.min(workWords.length, 2);
			});

			if (match) return [{ source: 'Projekt Gutenberg-DE', format: 'Volltext', url: match, label: title }];
		} catch (e) {
			console.error(`Error searching Gutenberg for ${title}:`, e);
		}
	}
	return [];
}

async function searchArchiveOrg(work, authorName) {
	const titles = [work.title, ...(work.aliases || [])];
	const results = [];

	for (const title of titles) {
		// 1. Search for Texts/Downloads
		const textQuery = `creator:("${authorName}") AND title:("${title}") AND mediatype:(texts) AND (language:ger OR language:german OR language:deu OR language:de)`;
		const textParams = new URLSearchParams({
			q: textQuery,
			fl: 'identifier,title,format,language,date,publicdate',
			sort: 'date desc',
			output: 'json',
			rows: '10',
		});

		try {
			const res = await fetch(`https://archive.org/advancedsearch.php?${textParams}`);
			if (res.ok) {
				const data = await res.json();
				const docs = data.response?.docs || [];

				let bestDoc = null;
				let bestScore = -1;

				for (const doc of docs) {
					const formats = doc.format || [];
					const hasGoodFormat = formats.some((f) =>
						['EPUB', 'Text PDF', 'Kindle', 'Daisy'].includes(f),
					);
					if (!hasGoodFormat) continue;

					let score = 0;
					if (formats.includes('EPUB')) score += 10;
					if (formats.includes('Text PDF')) score += 5;
					if (formats.includes('Kindle')) score += 2;

					if (score > bestScore) {
						bestScore = score;
						bestDoc = doc;
					}
				}

				if (bestDoc) {
					results.push({
						source: 'Internet Archive',
						format: 'Volltext / Download',
						url: `https://archive.org/details/${bestDoc.identifier}`,
						label: bestDoc.title || work.title,
						formats: (bestDoc.format || []).filter((f) =>
							['EPUB', 'Text PDF', 'Kindle'].includes(f),
						),
					});
				}
			}
		} catch {
			/* ignore */
		}

		// 2. Search for Videos (Verfilmungen)
		const videoQuery = `(("${authorName}") AND ("${title}")) AND mediatype:(movies OR video) AND (language:ger OR language:german OR language:deu OR language:de)`;
		const videoParams = new URLSearchParams({
			q: videoQuery,
			fl: 'identifier,title,mediatype,language',
			output: 'json',
			rows: '5',
		});

		try {
			const res = await fetch(`https://archive.org/advancedsearch.php?${videoParams}`);
			if (res.ok) {
				const data = await res.json();
				const docs = data.response?.docs || [];
				for (const doc of docs) {
					// Minimal validation: check if title contains the work title or author
					const tLower = doc.title.toLowerCase();
					if (tLower.includes(normalize(title)) || tLower.includes(normalize(authorName))) {
						results.push({
							source: 'Internet Archive',
							format: 'Verfilmung',
							url: `https://archive.org/details/${doc.identifier}`,
							label: doc.title,
						});
						break;
					}
				}
			}
		} catch {
			/* ignore */
		}

		if (results.length > 0) break;
	}
	return results;
}

async function main() {
	let updated = 0;
	let skipped = 0;

	// Group works by author for efficiency
	const worksByAuthor = new Map();
	for (const work of works) {
		if (!worksByAuthor.has(work.author_id)) {
			worksByAuthor.set(work.author_id, []);
		}
		worksByAuthor.get(work.author_id).push(work);
	}

	const worksByAuthorEntries = Array.from(worksByAuthor.entries());

	await pMap(
		worksByAuthorEntries,
		async ([authorId, authorWorks]) => {
			const author = authors.get(authorId);
			if (!author) {
				console.log(`  Skipping works for unknown author ${authorId}`);
				return;
			}

			console.log(`Processing author: ${author.name}`);
			const lvBooks = await getLibriVoxBooks(author.name);

			await pMap(
				authorWorks,
				async (work) => {
					const linksPath = join(LINKS_DIR, `${work.slug}.json`);
					const existing = existsSync(linksPath) ? readJson(linksPath) : [];
					const existingUrls = new Set(existing.map((l) => l.url));
					const existingSources = new Set(existing.map((l) => l.source));

					let workUpdated = false;
					const newLinks = existing.filter(l => typeof l === 'object' && l !== null);
					if (newLinks.length !== existing.length) workUpdated = true;

					// LibriVox matching
					for (const book of lvBooks) {
						if (existingUrls.has(book.url_librivox)) continue;

						let matched = false;
						// Match by book title
						if (isMatch(work, book.title)) {
							matched = true;
						} else {
							// Match by section titles
							for (const section of book.sections || []) {
								if (isMatch(work, section.title)) {
									matched = true;
									break;
								}
							}
						}

						if (matched) {
							newLinks.push({
								source: 'LibriVox',
								format: 'Hörbuch',
								url: book.url_librivox,
								label: book.title,
								librivox_id: book.id,
							});
							existingUrls.add(book.url_librivox);
							workUpdated = true;
							console.log(`  + LibriVox: "${work.title}" -> "${book.title}"`);
						}
					}

					// Projekt Gutenberg-DE matching
					if (!existingSources.has('Projekt Gutenberg-DE')) {
						const pg = await searchProjektGutenberg(work, author.name);
						if (pg.length > 0 && !existingUrls.has(pg[0].url)) {
							newLinks.push(pg[0]);
							workUpdated = true;
							console.log(`  + Projekt Gutenberg-DE: "${work.title}"`);
						}
					}

					// Archive.org matching
					const hasIAText = existing.some(
						(l) => l.source === 'Internet Archive' && l.format === 'Volltext / Download',
					);
					const hasIAVideo = existing.some(
						(l) => l.source === 'Internet Archive' && l.format === 'Verfilmung',
					);

					if (!hasIAText || !hasIAVideo) {
						const archive = await searchArchiveOrg(work, author.name);
						for (const link of archive) {
							if (existingUrls.has(link.url)) continue;
							if (link.format === 'Volltext / Download' && hasIAText) continue;
							if (link.format === 'Verfilmung' && hasIAVideo) continue;

							newLinks.push(link);
							workUpdated = true;
							console.log(`  + Internet Archive (${link.format}): "${work.title}"`);
						}
					}

					if (workUpdated) {
						writeJson(linksPath, newLinks);
						updated++;
					} else {
						skipped++;
					}
				},
				CONCURRENCY,
			);
		},
		3,
	);

	console.log(`\nDone: ${updated} updated, ${skipped} unchanged`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
