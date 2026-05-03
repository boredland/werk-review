import type { Handle } from '@sveltejs/kit';
import { getSession, SESSION_COOKIE } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (token && event.platform?.env.SESSION_KV) {
		const user = await getSession(event.platform.env.SESSION_KV, token);
		if (user) {
			event.locals.user = user;
		}
	}

	return resolve(event);
};
