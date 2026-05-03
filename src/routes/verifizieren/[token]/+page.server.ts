import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';
import { createSession, SESSION_COOKIE } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
	if (!platform?.env.DB || !platform?.env.SESSION_KV) {
		error(500, 'Datenbank nicht verfügbar');
	}

	const db = getDb(platform.env.DB);
	const user = await db.select().from(users).where(eq(users.verifyToken, params.token)).get();

	if (!user) {
		error(404, 'Ungültiger oder abgelaufener Bestätigungslink');
	}

	if (user.emailVerified) {
		redirect(303, '/verifizieren?ok=1');
	}

	await db
		.update(users)
		.set({ emailVerified: true, verifyToken: null })
		.where(eq(users.id, user.id));

	const sessionToken = await createSession(platform.env.SESSION_KV, {
		id: user.id,
		username: user.username,
		email: user.email,
		emailVerified: true,
	});
	cookies.set(SESSION_COOKIE, sessionToken, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30,
	});

	redirect(303, '/verifizieren?ok=1');
};
