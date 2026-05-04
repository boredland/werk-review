import { getAuthors, getWorksByAuthor } from '$lib/server/data';
import { getWikipediaImageUrls } from '$lib/server/wikipedia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const allAuthors = getAuthors();
	const kv = platform?.env.SESSION_KV;
	const imageUrls = await getWikipediaImageUrls(
		allAuthors.map((a) => a.name),
		kv,
	);

	const authors = allAuthors.map((a) => ({
		...a,
		workCount: getWorksByAuthor(a.id).length,
		imageUrl: imageUrls.get(a.name) ?? null,
	}));

	return { authors };
};
