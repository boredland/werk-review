import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';
import { createSession, hashPassword, SESSION_COOKIE } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request, platform, cookies }) => {
		if (!platform?.env.DB || !platform?.env.SESSION_KV) {
			return fail(500, { error: 'Datenbank nicht verfügbar.', username: '', email: '' });
		}

		const data = await request.formData();
		const username = (data.get('username') as string)?.trim();
		const email = (data.get('email') as string)?.trim().toLowerCase();
		const password = data.get('password') as string;
		const passwordConfirm = data.get('password_confirm') as string;

		const formError = (error: string) =>
			fail(400, { error, username: username ?? '', email: email ?? '' });

		if (!username || !email || !password) {
			return formError('Alle Felder sind erforderlich.');
		}

		if (username.length < 3 || username.length > 30) {
			return formError('Benutzername muss zwischen 3 und 30 Zeichen lang sein.');
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
			return formError(
				'Benutzername darf nur Buchstaben, Zahlen, Bindestriche und Unterstriche enthalten.',
			);
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return formError('Bitte gib eine gültige E-Mail-Adresse ein.');
		}

		if (password.length < 8) {
			return formError('Passwort muss mindestens 8 Zeichen lang sein.');
		}

		if (password !== passwordConfirm) {
			return formError('Passwörter stimmen nicht überein.');
		}

		const db = getDb(platform.env.DB);

		const existingUsername = await db
			.select()
			.from(users)
			.where(eq(users.username, username))
			.get();
		if (existingUsername) {
			return formError('Dieser Benutzername ist bereits vergeben.');
		}

		const existingEmail = await db.select().from(users).where(eq(users.email, email)).get();
		if (existingEmail) {
			return formError('Diese E-Mail-Adresse ist bereits registriert.');
		}

		const id = crypto.randomUUID();
		const passwordHash = await hashPassword(password);
		const verifyToken = crypto.randomUUID();

		await db.insert(users).values({ id, username, email, passwordHash, verifyToken });

		const token = await createSession(platform.env.SESSION_KV, {
			id,
			username,
			email,
			emailVerified: false,
		});
		cookies.set(SESSION_COOKIE, token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30,
		});

		redirect(303, `/verifizieren?neu=1`);
	},
};
