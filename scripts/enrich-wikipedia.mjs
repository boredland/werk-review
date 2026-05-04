import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(import.meta.dirname, '..', 'data');
const WORKS_DIR = join(DATA_DIR, 'works');
const AUTHORS_DIR = join(DATA_DIR, 'authors');

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

function buildSearchTerms(title, authorName) {
	const terms = [
		`${title} (${authorName})`,
		`${title} (Novelle)`,
		`${title} (Roman)`,
		`${title} (Erzählung)`,
		title,
	];

	const baseTitle = title.replace(/\.\s*(Erste|Zweite|Dritte)\s*Fassung.*$/i, '').trim();
	if (baseTitle !== title) {
		terms.push(`${baseTitle} (${authorName})`, `${baseTitle} (Roman)`, baseTitle);
	}

	return terms;
}

async function fetchWikipediaSummary(title) {
	const encoded = encodeURIComponent(title.replace(/ /g, '_'));
	const url = `https://de.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		const data = await res.json();
		if (data.type === 'disambiguation') return null;
		return {
			extract: data.extract || null,
			url: data.content_urls?.desktop?.page || null,
		};
	} catch {
		return null;
	}
}

async function main() {
	let updatedPlots = 0;
	let updatedSources = 0;
	const now = new Date().toISOString().split('T')[0];

	const workFiles = readdirSync(WORKS_DIR).filter((f) => f.endsWith('.json'));

	for (const file of workFiles) {
		const path = join(WORKS_DIR, file);
		const work = readJson(path);
		let changed = false;

		const author = authors.get(work.author_id);
		const authorName = author?.name || '';
		const searchTerms = buildSearchTerms(work.title, authorName);

		if (!work.plot) {
			let result = null;
			for (const term of searchTerms) {
				result = await fetchWikipediaSummary(term);
				if (result?.extract) break;
				await sleep(200);
			}

			if (result?.extract && result.extract.length > 50) {
				work.plot = result.extract;
				work.plot_source = {
					label: 'Wikipedia',
					url: result.url,
				};
				work.plot_fetched_at = now;
				changed = true;
				updatedPlots++;
				console.log(`  + plot: "${work.title}"`);
			}
		}

		const hasWiki = work.sources?.some((s) => s.url?.includes('wikipedia'));
		if (!hasWiki) {
			for (const term of searchTerms) {
				const result = await fetchWikipediaSummary(term);
				if (result?.url) {
					work.sources = work.sources || [];
					work.sources.push({ label: 'Wikipedia', url: result.url });
					changed = true;
					updatedSources++;
					break;
				}
				await sleep(200);
			}
		}

		if (changed) {
			writeJson(path, work);
		}

		await sleep(300);
	}

	console.log(`\nDone: ${updatedPlots} plots added, ${updatedSources} Wikipedia sources added`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
