
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Mocking the environment to run the function
const DATA_DIR = './data';
const AUTHORS_DIR = join(DATA_DIR, 'authors');
const WORKS_DIR = join(DATA_DIR, 'works');

function readJson(path) {
	return JSON.parse(readFileSync(path, 'utf-8'));
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

async function searchProjektGutenberg(work, authorName) {
	const titles = [work.title, ...(work.aliases || [])];
	const authorSlug = authorName.toLowerCase().replace(/ /g, '-');
	const lastName = authorName.split(' ').pop().toLowerCase();

	for (const title of titles) {
		const slugs = [
			title.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
			title.toLowerCase().replace(/^(das|der|die|ein|eine) /i, '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
		];

		for (const workSlug of [...new Set(slugs)]) {
			const predictedUrl = `https://projekt-gutenberg.org/authors/${authorSlug}/books/${workSlug}/`;
			console.log(`Trying prediction: ${predictedUrl}`);
			try {
				const verifyRes = await fetch(predictedUrl);
				if (verifyRes.ok) {
					const text = await verifyRes.text();
					if (!text.includes('Buch nicht gefunden')) {
						return [{ source: 'Projekt Gutenberg-DE', format: 'Volltext', url: predictedUrl, label: title }];
					}
				}
			} catch (e) {}
		}

		const params = new URLSearchParams({ s: `${title} ${authorName}` });
		const url = `https://projekt-gutenberg.org/?${params}`;
        console.log(`Fallback to search: ${url}`);
		try {
			const res = await fetch(url);
			if (!res.ok) continue;
			const html = await res.text();
			const linkPattern = /href="(https:\/\/projekt-gutenberg\.org\/authors\/[^"]*\/books\/[^"]*)"/g;
			const matches = [...new Set([...html.matchAll(linkPattern)].map((m) => m[1]))];
			const nWork = normalize(title);
			const match = matches.find((m) => {
				const urlLower = m.toLowerCase();
				if (!urlLower.includes(lastName)) return false;
				const slug = urlLower.split('/').filter(Boolean).pop();
				const nSlug = slug.replace(/-/g, ' ');
				if (nSlug.includes(nWork) || nWork.includes(nSlug)) return true;
				return false;
			});
			if (match) return [{ source: 'Projekt Gutenberg-DE', format: 'Volltext', url: match, label: title }];
		} catch (e) {}
	}
	return [];
}

const work = readJson(join(WORKS_DIR, 'der-landvogt-von-greifensee.json'));
const author = readJson(join(AUTHORS_DIR, 'gottfried-keller.json'));

console.log('Testing Landvogt:');
await searchProjektGutenberg(work, author.name).then(console.log);

console.log('\nTesting Sinngedicht:');
await searchProjektGutenberg({ title: 'Das Sinngedicht' }, author.name).then(console.log);
