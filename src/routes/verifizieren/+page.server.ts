import type { PageServerLoad } from './$types';

// Renders the signed-in address, so this page is excluded from edge caching.
export const load: PageServerLoad = ({ locals }) => {
	return { email: locals.user?.email ?? null };
};
