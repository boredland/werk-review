const THUMB_SIZE = 960;
const CACHE_TTL = 3600; // Reduced from 1 week to 1 hour to propagate fixes
const TITLE_CACHE_TTL = 86400 * 30;
const USER_AGENT = 'werk.review/0.1 (https://werk.review; info@werk.review) generic-library/1.0';

interface WikiPerson {
	name: string;
	born?: number | null;
	died?: number | null;
}

async function wikiFetch(url: string) {
	return fetch(url, { headers: { 'User-Agent': USER_AGENT } });
}

function toTitle(name: string): string {
	return name.replace(/ /g, '_');
}

// The bare author name often points at a disambiguation page (e.g.
// "Alexandre Dumas"). Resolve it to the specific person's article by matching
// their birth/death years against candidate article intros.
async function disambiguateByDates(person: WikiPerson): Promise<string | null> {
	if (person.born == null && person.died == null) return null;

	const params = new URLSearchParams({
		action: 'query',
		format: 'json',
		generator: 'search',
		gsrsearch: person.name,
		gsrlimit: '6',
		prop: 'extracts|pageprops',
		exintro: '1',
		explaintext: '1',
		ppprop: 'disambiguation',
	});

	try {
		const res = await wikiFetch(`https://de.wikipedia.org/w/api.php?${params}`);
		if (!res.ok) return null;
		const data = await res.json<{
			query?: {
				pages?: Record<
					string,
					{
						title: string;
						extract?: string;
						index?: number;
						pageprops?: { disambiguation?: string };
					}
				>;
			};
		}>();

		const pages = Object.values(data.query?.pages ?? {});
		let best: { title: string; score: number; index: number } | null = null;

		for (const page of pages) {
			if (page.pageprops?.disambiguation !== undefined) continue;
			const extract = page.extract ?? '';

			let score = 0;
			if (person.born != null && extract.includes(String(person.born))) score += 2;
			if (person.died != null && extract.includes(String(person.died))) score += 2;
			if (score === 0) continue;

			const index = page.index ?? Number.MAX_SAFE_INTEGER;
			if (!best || score > best.score || (score === best.score && index < best.index)) {
				best = { title: page.title, score, index };
			}
		}

		return best ? toTitle(best.title) : null;
	} catch {
		return null;
	}
}

export async function resolveWikipediaTitle(person: WikiPerson, kv?: KVNamespace): Promise<string> {
	const naiveTitle = toTitle(person.name);
	const cacheKey = `wiki-title-v1:${naiveTitle}:${person.born ?? ''}:${person.died ?? ''}`;

	if (kv) {
		const cached = await kv.get(cacheKey);
		if (cached) return cached;
	}

	let resolved = naiveTitle;
	try {
		const res = await wikiFetch(
			`https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(naiveTitle)}`,
		);
		if (res.ok) {
			const data = await res.json<{ type?: string; titles?: { canonical?: string } }>();
			if (data.type === 'disambiguation') {
				resolved = (await disambiguateByDates(person)) ?? naiveTitle;
			} else if (data.titles?.canonical) {
				resolved = data.titles.canonical;
			}
		}
	} catch {
		// Fall back to the naive title.
	}

	if (kv) kv.put(cacheKey, resolved, { expirationTtl: TITLE_CACHE_TTL });
	return resolved;
}

export function wikipediaPageUrl(title: string): string {
	return `https://de.wikipedia.org/wiki/${encodeURIComponent(title)}`;
}

export async function getWikipediaImageUrl(
	name: string,
	kv?: KVNamespace,
	title = toTitle(name),
): Promise<string | null> {
	const cacheKey = `wiki-img-v2:${title}`;

	if (kv) {
		const cached = await kv.get(cacheKey);
		if (cached) return cached === '__none__' ? null : cached;
	}

	try {
		const url = `https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
		const res = await wikiFetch(url);
		if (!res.ok) {
			// Only cache negative hits for 1 hour to allow for retry
			if (kv) kv.put(cacheKey, '__none__', { expirationTtl: 3600 });
			return null;
		}

		const data = await res.json<{
			thumbnail?: { source: string; width: number };
			originalimage?: { source: string; width: number };
		}>();

		let imageUrl = data.thumbnail?.source ?? data.originalimage?.source ?? null;

		// If it's a thumbnail URL, try to get a higher resolution version
		if (imageUrl?.includes('/thumb/') && data.thumbnail && data.thumbnail.width < THUMB_SIZE) {
			imageUrl = imageUrl.replace(/\/\d+px-/, `/${THUMB_SIZE}px-`);
		}

		if (imageUrl) {
			imageUrl = `/img/${imageUrl.replace('https://', '')}?w=${THUMB_SIZE}`;
		}

		if (kv) {
			kv.put(cacheKey, imageUrl ?? '__none__', { expirationTtl: CACHE_TTL });
		}

		return imageUrl;
	} catch {
		return null;
	}
}

export async function getWikipediaImageUrls(
	people: WikiPerson[],
	kv?: KVNamespace,
): Promise<Map<string, string>> {
	const result = new Map<string, string>();
	const fetches = people.map(async (person) => {
		const title = await resolveWikipediaTitle(person, kv);
		const url = await getWikipediaImageUrl(person.name, kv, title);
		if (url) result.set(person.name, url);
	});
	await Promise.all(fetches);
	return result;
}
