import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(import.meta.dirname, '..', 'data');
const WORKS_DIR = join(DATA_DIR, 'works');
const AUTHORS_DIR = join(DATA_DIR, 'authors');

const GEMINI_PROXY_URL = process.env.GEMINI_PROXY_URL;
const GEMINI_PROXY_SECRET = process.env.GEMINI_PROXY_SECRET;

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

const authors = new Map();
for (const file of readdirSync(AUTHORS_DIR)) {
	if (!file.endsWith('.json')) continue;
	const author = readJson(join(AUTHORS_DIR, file));
	authors.set(author.id, author);
}

function buildSearchTerms(work, authorName) {
	const titles = [work.title, ...(work.aliases || [])];
	const terms = new Set();

	for (const title of titles) {
		terms.add(`${title} (${authorName})`);
		terms.add(`${title} (Novelle)`);
		terms.add(`${title} (Roman)`);
		terms.add(`${title} (Erzählung)`);
		terms.add(title);

		const baseTitle = title.replace(/\.\s*(Erste|Zweite|Dritte)\s*Fassung.*$/i, '').trim();
		if (baseTitle !== title) {
			terms.add(`${baseTitle} (${authorName})`);
			terms.add(`${baseTitle} (Roman)`);
			terms.add(baseTitle);
		}
	}

	return Array.from(terms);
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

async function fetchGeminiSummary(title, authorName) {
	if (!GEMINI_PROXY_URL || !GEMINI_PROXY_SECRET) return null;

	const prompt = `Schreibe eine kurze, sachliche Zusammenfassung (2-3 Sätze) der Handlung von „${title}" von ${authorName}. Konzentriere dich auf das, was in der Geschichte passiert, nicht auf literarische Analyse. Antworte nur mit der Zusammenfassung, ohne Einleitung.`;

	try {
		const res = await fetch(
			`${GEMINI_PROXY_URL}/${GEMINI_PROXY_SECRET}/v1beta/openai/chat/completions`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model: 'gemini-2.5-flash',
					messages: [{ role: 'user', content: prompt }],
					temperature: 0.3,
				}),
			},
		);
		if (!res.ok) return null;
		const data = await res.json();
		const text = data.choices?.[0]?.message?.content?.trim();
		if (!text || text.length < 30) return null;
		return text;
	} catch {
		return null;
	}
}

async function main() {
	let updatedPlots = 0;
	let geminiPlots = 0;
	let updatedSources = 0;
	const now = new Date().toISOString().split('T')[0];

	const workFiles = readdirSync(WORKS_DIR).filter((f) => f.endsWith('.json'));

	await pMap(workFiles, async (file) => {
		const path = join(WORKS_DIR, file);
		const work = readJson(path);
		let changed = false;

		const author = authors.get(work.author_id);
		const authorName = author?.name || '';
		const searchTerms = buildSearchTerms(work, authorName);

		if (!work.plot) {
			let result = null;
			for (const term of searchTerms) {
				result = await fetchWikipediaSummary(term);
				if (result?.extract) break;
			}

			if (result?.extract && result.extract.length > 50) {
				work.plot = result.extract;
				work.plot_source = { label: 'Wikipedia', url: result.url };
				work.plot_fetched_at = now;
				changed = true;
				updatedPlots++;
				console.log(`  + plot (Wikipedia): "${work.title}"`);
			} else {
				const geminiText = await fetchGeminiSummary(work.title, authorName);
				if (geminiText) {
					work.plot = geminiText;
					work.plot_source = { label: 'KI-generiert (Gemini)', url: null };
					work.plot_fetched_at = now;
					changed = true;
					geminiPlots++;
					console.log(`  + plot (Gemini): "${work.title}"`);
				}
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
			}
		}

		if (changed) {
			writeJson(path, work);
		}
	}, 10);

	console.log(
		`\nDone: ${updatedPlots} Wikipedia plots, ${geminiPlots} Gemini plots, ${updatedSources} Wikipedia sources added`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
