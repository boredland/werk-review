import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

if (!SHEET_ID) {
	console.error('Missing GOOGLE_SHEET_ID');
	process.exit(1);
}

const DATA_DIR = join(import.meta.dirname, '..', 'data');

function slugify(text) {
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
		.split(/[|,]/)
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
	gnd_id: z.string().nullable(),
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
	year_from: z.number().nullable(),
	year_to: z.number().nullable(),
	year_display: z.string(),
	parent_slugs: z.array(z.string()),
	gnd_id: z.string().nullable(),
	plot: z.string().nullable(),
	sources: z.array(z.object({ label: z.string(), url: z.string().url() })),
});

const GenreSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	slug: z.string().min(1),
});

// --- Fetch public Google Sheet as CSV ---

function parseCsvRow(line) {
	const fields = [];
	let current = '';
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inQuotes) {
			if (ch === '"' && line[i + 1] === '"') {
				current += '"';
				i++;
			} else if (ch === '"') {
				inQuotes = false;
			} else {
				current += ch;
			}
		} else if (ch === '"') {
			inQuotes = true;
		} else if (ch === ',') {
			fields.push(current);
			current = '';
		} else {
			current += ch;
		}
	}
	fields.push(current);
	return fields;
}

function parseCsv(text) {
	const lines = [];
	let current = '';
	let inQuotes = false;
	for (const ch of text) {
		if (ch === '"') inQuotes = !inQuotes;
		if ((ch === '\n' || ch === '\r') && !inQuotes) {
			if (current.trim()) lines.push(current);
			current = '';
		} else {
			current += ch;
		}
	}
	if (current.trim()) lines.push(current);

	if (lines.length === 0) return [];
	const headers = parseCsvRow(lines[0]);
	return lines.slice(1).map((line) => {
		const values = parseCsvRow(line);
		const obj = {};
		headers.forEach((h, i) => {
			obj[h.trim()] = values[i] ?? '';
		});
		return obj;
	});
}

async function fetchSheet(sheetName) {
	const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch sheet "${sheetName}": ${res.status}`);
	}
	const text = await res.text();
	return parseCsv(text);
}

// --- Transform rows to JSON ---

function transformAuthor(row) {
	const slug = row.slug || slugify(row.name);
	return {
		id: row.id || slug,
		name: row.name,
		slug,
		aliases: parsePipeSeparated(row.aliases),
		born: parseNumber(row.born),
		died: parseNumber(row.died),
		gnd_id: row.gnd_id || null,
		bio: row.bio || '',
		sources: parseSources(row.sources),
	};
}

function transformWork(row) {
	const slug = row.slug || slugify(row.title);
	const yearFrom = parseNumber(row.year_from);
	const yearTo = parseNumber(row.year_to);
	let yearDisplay = row.year_display || '';
	if (!yearDisplay && yearFrom) {
		yearDisplay = yearTo && yearTo !== yearFrom ? `${yearFrom}–${yearTo}` : `${yearFrom}`;
	}

	return {
		id: row.id || slug,
		author_id: row.author_id,
		genre_ids: parsePipeSeparated(row.genre_id || row.genre_ids),
		title: row.title,
		slug,
		aliases: parsePipeSeparated(row.aliases),
		year_from: yearFrom,
		year_to: yearTo,
		year_display: yearDisplay,
		parent_slugs: parsePipeSeparated(row.parent_slug || row.parent_slugs),
		gnd_id: row.gnd_id || null,
		plot: row.plot || null,
		sources: parseSources(row.sources),
	};
}

function transformGenre(row) {
	const slug = row.slug || slugify(row.name);
	return {
		id: row.id || slug,
		name: row.name,
		slug,
	};
}

// --- Write files ---

function clearDir(dir) {
	mkdirSync(dir, { recursive: true });
	for (const file of readdirSync(dir)) {
		if (file.endsWith('.json')) unlinkSync(join(dir, file));
	}
}

function writeJson(path, data) {
	writeFileSync(path, `${JSON.stringify(data, null, '\t')}\n`);
}

// --- Main ---

async function main() {
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
	const authors = authorRows.map(transformAuthor);
	const works = workRows.map(transformWork);
	const genres = genreRows.map(transformGenre);

	// Validate
	let errors = 0;

	for (const author of authors) {
		const result = AuthorSchema.safeParse(author);
		if (!result.success) {
			console.error(`Invalid author "${author.name || author.id}":`, result.error.issues);
			errors++;
		}
	}

	const authorIds = new Set(authors.map((a) => a.id));
	const genreIds = new Set(genres.map((g) => g.id));
	const workIds = new Set(works.map((w) => w.id));

	for (const work of works) {
		const result = WorkSchema.safeParse(work);
		if (!result.success) {
			console.error(`Invalid work "${work.title || work.id}":`, result.error.issues);
			errors++;
		}
		if (!authorIds.has(work.author_id)) {
			console.error(`Work "${work.title}" references unknown author_id "${work.author_id}"`);
			errors++;
		}
		for (const gId of work.genre_ids) {
			if (!genreIds.has(gId)) {
				console.error(`Work "${work.title}" references unknown genre_id "${gId}"`);
				errors++;
			}
		}
		for (const pSlug of work.parent_slugs) {
			if (!workIds.has(pSlug)) {
				console.error(`Work "${work.title}" references unknown parent_slug "${pSlug}"`);
				errors++;
			}
		}
	}

	for (const genre of genres) {
		const result = GenreSchema.safeParse(genre);
		if (!result.success) {
			console.error(`Invalid genre "${genre.name || genre.id}":`, result.error.issues);
			errors++;
		}
	}

	if (errors > 0) {
		console.error(`\n${errors} validation error(s). Aborting.`);
		process.exit(1);
	}

	console.log('\nValidation passed. Writing files...');

	// Write authors
	clearDir(join(DATA_DIR, 'authors'));
	for (const author of authors) {
		writeJson(join(DATA_DIR, 'authors', `${author.slug}.json`), author);
	}

	// Write works
	clearDir(join(DATA_DIR, 'works'));
	for (const work of works) {
		writeJson(join(DATA_DIR, 'works', `${work.slug}.json`), work);
	}

	// Write genres
	writeJson(join(DATA_DIR, 'genres.json'), genres);

	console.log(`\nDone:`);
	console.log(`  ${authors.length} authors`);
	console.log(`  ${works.length} works`);
	console.log(`  ${genres.length} genres`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
