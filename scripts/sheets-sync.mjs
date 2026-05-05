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
	gnd_id: z.string().nullable(),
	bio: z.string(),
	photo_r2_key: z.string().nullable(),
	sources: z.array(z.object({ label: z.string(), url: z.string().url() })),
});

const WorkSchema = z.object({
	id: z.string().min(1),
	author_id: z.string().min(1),
	genre_id: z.string().min(1),
	title: z.string().min(1),
	slug: z.string().min(1),
	aliases: z.array(z.string()),
	year_from: z.number().nullable(),
	year_to: z.number().nullable(),
	year_display: z.string(),
	parent_id: z.string().nullable(),
	collection_title: z.string().nullable(),
	collection_aliases: z.array(z.string()),
	gnd_id: z.string().nullable(),
	plot: z.string().nullable(),
	sources: z.array(z.object({ label: z.string(), url: z.string().url() })),
});

const GenreSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	slug: z.string().min(1),
});

const LinkSchema = z.object({
	source: z.string().min(1),
	format: z.string().min(1),
	url: z.string().url(),
	label: z.string().min(1),
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
		photo_r2_key: row.photo_r2_key || null,
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
		genre_id: row.genre_id,
		title: row.title,
		slug,
		aliases: parsePipeSeparated(row.aliases),
		year_from: yearFrom,
		year_to: yearTo,
		year_display: yearDisplay,
		parent_id: row.parent_id || null,
		collection_title: row.collection_title || null,
		collection_aliases: parsePipeSeparated(row.collection_aliases),
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

function transformLink(row) {
	return {
		source: row.source,
		format: row.format,
		url: row.url,
		label: row.label,
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

	const [authorRows, workRows, genreRows, linkRows] = await Promise.all([
		fetchSheet('Autoren'),
		fetchSheet('Werke'),
		fetchSheet('Genres'),
		fetchSheet('Links').catch(() => {
			console.log('No "Links" sheet found, skipping.');
			return [];
		}),
	]);

	console.log(`  Autoren: ${authorRows.length} rows`);
	console.log(`  Werke: ${workRows.length} rows`);
	console.log(`  Genres: ${genreRows.length} rows`);
	console.log(`  Links: ${linkRows.length} rows`);

	// Transform
	const authors = authorRows.map(transformAuthor);
	const works = workRows.map(transformWork);
	const genres = genreRows.map(transformGenre);

	// Group links by work_id
	const linksByWork = new Map();
	for (const row of linkRows) {
		const workId = row.work_id;
		if (!workId) continue;
		const link = transformLink(row);
		if (!linksByWork.has(workId)) linksByWork.set(workId, []);
		linksByWork.get(workId).push(link);
	}

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
		if (!genreIds.has(work.genre_id)) {
			console.error(`Work "${work.title}" references unknown genre_id "${work.genre_id}"`);
			errors++;
		}
		if (work.parent_id && !workIds.has(work.parent_id)) {
			console.error(`Work "${work.title}" references unknown parent_id "${work.parent_id}"`);
			errors++;
		}
	}

	for (const genre of genres) {
		const result = GenreSchema.safeParse(genre);
		if (!result.success) {
			console.error(`Invalid genre "${genre.name || genre.id}":`, result.error.issues);
			errors++;
		}
	}

	const workIds = new Set(works.map((w) => w.id));
	for (const [workId, links] of linksByWork) {
		if (!workIds.has(workId)) {
			console.error(`Links reference unknown work_id "${workId}"`);
			errors++;
		}
		for (const link of links) {
			const result = LinkSchema.safeParse(link);
			if (!result.success) {
				console.error(`Invalid link for work "${workId}":`, result.error.issues);
				errors++;
			}
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

	// Write links
	clearDir(join(DATA_DIR, 'links'));
	for (const [workId, links] of linksByWork) {
		const work = works.find((w) => w.id === workId);
		const filename = work ? work.slug : workId;
		writeJson(join(DATA_DIR, 'links', `${filename}.json`), links);
	}

	console.log(`\nDone:`);
	console.log(`  ${authors.length} authors`);
	console.log(`  ${works.length} works`);
	console.log(`  ${genres.length} genres`);
	console.log(`  ${linksByWork.size} works with links`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
