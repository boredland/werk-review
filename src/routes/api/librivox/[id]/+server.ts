import { json } from '@sveltejs/kit';
import type { LibriVoxData } from '$lib/types';
import type { RequestHandler } from './$types';

// LibriVox is frequently slow; bound the call so a stall cannot escalate into a
// gateway timeout for the caller.
const FETCH_TIMEOUT_MS = 5000;

export const GET: RequestHandler = async ({ params, platform }) => {
	const librivoxId = params.id;
	if (!librivoxId) {
		return json({ error: 'Missing LibriVox ID' }, { status: 400 });
	}

	const cacheKey = `librivox:${librivoxId}`;
	const kv = platform?.env.SESSION_KV;

	if (kv) {
		try {
			const cached = await kv.get(cacheKey);
			if (cached) {
				return json(JSON.parse(cached));
			}
		} catch (e) {
			console.error('KV get error:', e);
		}
	}

	try {
		const res = await fetch(
			`https://librivox.org/api/feed/audiobooks/?id=${librivoxId}&extended=1&format=json`,
			{ signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
		);
		if (!res.ok) {
			return json({ error: 'Failed to fetch from LibriVox API' }, { status: res.status });
		}

		const data = (await res.json()) as LibriVoxData;

		if (kv && data.books && data.books.length > 0) {
			// Cache for 24 hours
			await kv.put(cacheKey, JSON.stringify(data), { expirationTtl: 86400 });
		}

		return json(data);
	} catch (e) {
		return json({ error: 'Internal server error while fetching LibriVox data' }, { status: 500 });
	}
};
