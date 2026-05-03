import { redirect } from '@sveltejs/kit';
import { destroySession, SESSION_COOKIE } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies, platform }) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token && platform?.env.SESSION_KV) {
			await destroySession(platform.env.SESSION_KV, token);
		}
		cookies.delete(SESSION_COOKIE, { path: '/' });
		redirect(303, '/');
	},
};
