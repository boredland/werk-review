import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const DATA_DIR = join(import.meta.dirname, '..', 'data');

function slugify(text) {
	if (!text) return '';
	return text
		.toLowerCase()
		.replace(/[äÄ]/g, 'ae')
		.replace(/[öÖ]/g, 'oe')
		.replace(/[üÜ]/g, 'ue')
		.replace(/ß/g, 'ss')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function parsePipeSeparated(val) {
	if (!val || val.trim() === '') return [];
	return val
		.split('|')
		.map((s) => s.trim())
		.filter(Boolean);
}

function parseNumber(val) {
	if (val === '' || val === null || val === undefined) return null;
	const n = Number(val);
	return Number.isNaN(n) ? null : n;
}

function parseSources(val) {
	if (!val || val.trim() === '') return [];
	return val
		.split('|')
		.map((entry) => {
			const match = entry.trim().match(/^(.+?)\s*<(.+)>$/);
			if (!match) return null;
			return { label: match[1].trim(), url: match[2].trim() };
		})
		.filter(Boolean);
}

// --- Zod schemas ---

const AuthorSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	slug: z.string().min(1),
	aliases: z.array(z.string()),
	born: z.number().nullable(),
	died: z.number().nullable(),
	bio: z.string(),
	sources: z.array(z.object({ label: z.string(), url: z.string().url() })),
});

const WorkSchema = z.object({
	id: z.string().min(1),
	author_id: z.string().min(1),
	genre_ids: z.array(z.string()).min(1),
	title: z.string().min(1),
	slug: z.string().min(1),
	aliases: z.array(z.string()),
	year: z.number().nullable(),
	year_display: z.string(),
	parent_slugs: z.array(z.string()),
	plot: z.string().nullable(),
	sources: z.array(
		z.object({
			label: z.string(),
			url: z.string().url(),
			source: z.string().optional(),
			format: z.string().optional(),
			manual: z.boolean().optional(),
		}),
	),
});

const GenreSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	slug: z.string().min(1),
});

// --- Fetch public Google Sheet as CSV ---

function parseCsv(text) {
	const rows = [];
	let currentField = '';
	let inQuotes = false;
	let currentRow = [];

	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		const next = text[i + 1];

		if (inQuotes) {
			if (ch === '"' && next === '"') {
				currentField += '"';
				i++;
			} else if (ch === '"') {
				inQuotes = false;
			} else {
				currentField += ch;
			}
		} else {
			if (ch === '"') {
				inQuotes = true;
			} else if (ch === ',') {
				currentRow.push(currentField);
				currentField = '';
			} else if (ch === '\n' || ch === '\r') {
				if (ch === '\r' && next === '\n') i++;
				currentRow.push(currentField);
				if (currentRow.some((f) => f.trim() !== '')) {
					rows.push(currentRow);
				}
				currentRow = [];
				currentField = '';
			} else {
				currentField += ch;
			}
		}
	}
	if (currentField !== '' || currentRow.length > 0) {
		currentRow.push(currentField);
		if (currentRow.some((f) => f.trim() !== '')) {
			rows.push(currentRow);
		}
	}

	if (rows.length === 0) return [];
	const headers = rows[0].map((h) => h.trim().replace(/^"|"$/g, ''));
	return rows.slice(1).map((values) => {
		const obj = {};
		headers.forEach((h, i) => {
			const val = values[i] ?? '';
			obj[h] = val.trim().replace(/^"|"$/g, '');
		});
		return obj;
	});
}

async function fetchSheet(sheetName) {
	const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(sheetName)}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch sheet "${sheetName}": ${res.status}`);
	}
	const text = await res.text();
	return parseCsv(text);
}

function parseManualLink(url, type) {
	if (!url || url.trim() === '') return null;
	const trimmedUrl = url.trim();
	let source = 'Unbekannt';
	let format = type === 'audiobook' ? 'Hörbuch' : 'Volltext';
	const label = type === 'audiobook' ? 'Hörbuch' : 'E-Book';

	if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
		source = 'YouTube';
	} else if (trimmedUrl.includes('librivox.org')) {
		source = 'LibriVox';
	} else if (trimmedUrl.includes('projekt-gutenberg.org')) {
		source = 'Projekt Gutenberg-DE';
	} else if (trimmedUrl.includes('archive.org')) {
		source = 'Internet Archive';
		format = type === 'audiobook' ? 'Hörbuch' : 'Volltext / Download';
	}

	return { source, format, url: trimmedUrl, label, manual: true };
}

// --- Transform rows to JSON ---

function transformAuthor(row) {
	const slug = slugify(row.name);
	return {
		id: row.id || slug,
		name: row.name,
		slug,
		aliases: parsePipeSeparated(row.aliases),
		born: parseNumber(row.born),
		died: parseNumber(row.died),
		bio: row.bio || '',
		sources: parseSources(row.sources),
	};
}

function transformWork(row) {
	const slug = slugify(row.title);
	const yearFromStr = row.year_display || '';
	const yearMatch = yearFromStr.match(/\d{4}/);
	const year = yearMatch ? Number(yearMatch[0]) : null;

	const sources = [];
	
	const audiobookLink = parseManualLink(row.audiobook, 'audiobook');
	if (audiobookLink) sources.unshift(audiobookLink);
	
	const ebookLink = parseManualLink(row.ebook, 'ebook');
	if (ebookLink) sources.unshift(ebookLink);

	return {
		id: row.id || slug,
		author_id: row.author_id,
		genre_ids: parsePipeSeparated(row.genre_id || row.genre_ids),
		title: row.title,
		slug,
		aliases: parsePipeSeparated(row.aliases),
		year,
		year_display: row.year_display || '',
		parent_slugs: parsePipeSeparated(row.parent_slug || row.parent_slugs),
		plot: row.plot || null,
		sources,
	};
}

function transformGenre(row) {
	const slug = slugify(row.name);
	return {
		id: row.id || slug,
		name: row.name,
		slug,
	};
}

function readJson(path) {
	return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJson(path, data) {
	writeFileSync(path, `${JSON.stringify(data, null, '\t')}\n`);
}

async function main() {
	if (!SHEET_ID) {
		console.error('Error: GOOGLE_SHEET_ID environment variable is not set.');
		process.exit(1);
	}

	console.log('Fetching sheets...');
	const [authorRows, workRows, genreRows] = await Promise.all([
		fetchSheet('Autoren'),
		fetchSheet('Werke'),
		fetchSheet('Genres'),
	]);

	console.log(`  Autoren: ${authorRows.length} rows`);
	console.log(`  Werke: ${workRows.length} rows`);
	console.log(`  Genres: ${genreRows.length} rows`);

	// Transform
	const authors = authorRows.filter((r) => r.name).map(transformAuthor);
	const works = workRows.filter((r) => r.title).map(transformWork);
	const genres = genreRows.filter((r) => r.name).map(transformGenre);

	// Validate
	let errors = 0;
	authors.forEach((a) => {
		const res = AuthorSchema.safeParse(a);
		if (!res.success) {
			console.error(`Invalid author: ${a.name}`, res.error.format());
			errors++;
		}
	});
	works.forEach((w) => {
		const res = WorkSchema.safeParse(w);
		if (!res.success) {
			console.error(`Invalid work: ${w.title}`, res.error.format());
			errors++;
		}
	});
	genres.forEach((g) => {
		const res = GenreSchema.safeParse(g);
		if (!res.success) {
			console.error(`Invalid genre: ${g.name}`, res.error.format());
			errors++;
		}
	});

	if (errors > 0) {
		console.error(`\nFound ${errors} validation errors. Aborting.`);
		process.exit(1);
	}

	console.log('\nValidation passed. Writing files...');

	// Clear existing files to handle deletions/renames
	const WORKS_DIR = join(DATA_DIR, 'works');
	const AUTHORS_DIR = join(DATA_DIR, 'authors');
	const GENRES_DIR = join(DATA_DIR, 'genres');

	if (!existsSync(WORKS_DIR)) writeFileSync(join(WORKS_DIR, '.keep'), '');
	if (!existsSync(AUTHORS_DIR)) writeFileSync(join(AUTHORS_DIR, '.keep'), '');
	if (!existsSync(GENRES_DIR)) writeFileSync(join(GENRES_DIR, '.keep'), '');

	// Write new files
	authors.forEach((a) => {
		writeJson(join(AUTHORS_DIR, `${a.slug}.json`), a);
	});
	works.forEach((w) => {
		writeJson(join(WORKS_DIR, `${w.slug}.json`), w);
	});
	writeJson(join(DATA_DIR, 'genres.json'), genres);

	console.log(
		`\nDone:\n  ${authors.length} authors\n  ${works.length} works\n  ${genres.length} genres`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
