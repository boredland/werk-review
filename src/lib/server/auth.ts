const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
	const key = await deriveKey(password, salt);
	const hash = await crypto.subtle.exportKey('raw', key);
	return `${toHex(salt)}:${toHex(new Uint8Array(hash))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [saltHex, hashHex] = stored.split(':');
	const salt = fromHex(saltHex);
	const key = await deriveKey(password, salt);
	const hash = new Uint8Array(await crypto.subtle.exportKey('raw', key));
	const expected = fromHex(hashHex);
	if (hash.length !== expected.length) return false;
	let diff = 0;
	for (let i = 0; i < hash.length; i++) diff |= hash[i] ^ expected[i];
	return diff === 0;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey'],
	);
	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
		keyMaterial,
		{ name: 'AES-GCM', length: KEY_LENGTH * 8 },
		true,
		['encrypt'],
	);
}

function toHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function fromHex(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	return bytes;
}

export interface SessionUser {
	id: string;
	username: string;
	email: string;
}

export async function createSession(kv: KVNamespace, user: SessionUser): Promise<string> {
	const token = crypto.randomUUID();
	await kv.put(`session:${token}`, JSON.stringify(user), { expirationTtl: SESSION_TTL });
	return token;
}

export async function getSession(kv: KVNamespace, token: string): Promise<SessionUser | null> {
	const data = await kv.get(`session:${token}`);
	if (!data) return null;
	return JSON.parse(data) as SessionUser;
}

export async function destroySession(kv: KVNamespace, token: string): Promise<void> {
	await kv.delete(`session:${token}`);
}

export const SESSION_COOKIE = 'session';
