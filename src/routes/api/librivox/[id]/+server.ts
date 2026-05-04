import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const librivoxId = params.id;
	if (!librivoxId) {
		return json({ error: 'Missing LibriVox ID' }, { status: 400 });
	}

	try {
		const res = await fetch(
			`https://librivox.org/api/feed/audiobooks/?id=${librivoxId}&extended=1&format=json`,
		);
		if (!res.ok) {
			return json({ error: 'Failed to fetch from LibriVox API' }, { status: res.status });
		}

		const data = await res.json();
		return json(data);
	} catch (e) {
		return json({ error: 'Internal server error while fetching LibriVox data' }, { status: 500 });
	}
};
