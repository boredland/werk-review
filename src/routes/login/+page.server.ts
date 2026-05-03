import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';
import { createSession, SESSION_COOKIE, verifyPassword } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request, platform, cookies }) => {
		const formError = (msg: string, emailVal = '') => fail(400, { error: msg, email: emailVal });

		if (!platform?.env.DB || !platform?.env.SESSION_KV) {
			return formError('Datenbank nicht verfügbar.');
		}

		const data = await request.formData();
		const email = (data.get('email') as string)?.trim().toLowerCase();
		const password = data.get('password') as string;

		if (!email || !password) {
			return formError('Alle Felder sind erforderlich.', email);
		}

		const db = getDb(platform.env.DB);
		const user = await db.select().from(users).where(eq(users.email, email)).get();

		if (!user?.passwordHash) {
			return formError('E-Mail oder Passwort ist falsch.', email);
		}

		const valid = await verifyPassword(password, user.passwordHash);
		if (!valid) {
			return formError('E-Mail oder Passwort ist falsch.', email);
		}

		const token = await createSession(platform.env.SESSION_KV, {
			id: user.id,
			username: user.username,
			email: user.email,
		});

		cookies.set(SESSION_COOKIE, token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30,
		});

		redirect(303, '/');
	},
};
