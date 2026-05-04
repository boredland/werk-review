const THUMB_SIZE = 800;
const CACHE_TTL = 86400 * 7;

export async function getWikipediaImageUrl(name: string, kv?: KVNamespace): Promise<string | null> {
	const title = name.replace(/ /g, '_');
	const cacheKey = `wiki-img:${title}`;

	if (kv) {
		const cached = await kv.get(cacheKey);
		if (cached) return cached === '__none__' ? null : cached;
	}

	try {
		const url = `https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
		const res = await fetch(url);
		if (!res.ok) {
			if (kv) kv.put(cacheKey, '__none__', { expirationTtl: CACHE_TTL });
			return null;
		}

		const data = await res.json<{ thumbnail?: { source: string; width: number } }>();
		let imageUrl = data.thumbnail?.source ?? null;
		if (imageUrl && data.thumbnail && data.thumbnail.width < THUMB_SIZE) {
			imageUrl = imageUrl.replace(/\/\d+px-/, `/${THUMB_SIZE}px-`);
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
	names: string[],
	kv?: KVNamespace,
): Promise<Map<string, string>> {
	const result = new Map<string, string>();
	const fetches = names.map(async (name) => {
		const url = await getWikipediaImageUrl(name, kv);
		if (url) result.set(name, url);
	});
	await Promise.all(fetches);
	return result;
}
