const DEFAULT_WINDOW = 900;
const DEFAULT_MAX = 10;

interface RateLimitOptions {
	prefix: string;
	windowSeconds?: number;
	maxAttempts?: number;
}

export async function checkRateLimit(
	kv: KVNamespace,
	key: string,
	opts: RateLimitOptions,
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
	const window = opts.windowSeconds ?? DEFAULT_WINDOW;
	const max = opts.maxAttempts ?? DEFAULT_MAX;
	const kvKey = `rl:${opts.prefix}:${key}`;

	const raw = await kv.get(kvKey);
	const now = Math.floor(Date.now() / 1000);

	let attempts: number[] = raw ? JSON.parse(raw) : [];
	attempts = attempts.filter((t) => t > now - window);

	if (attempts.length >= max) {
		const oldest = Math.min(...attempts);
		return { allowed: false, remaining: 0, retryAfter: oldest + window - now };
	}

	attempts.push(now);
	await kv.put(kvKey, JSON.stringify(attempts), { expirationTtl: window });

	return { allowed: true, remaining: max - attempts.length, retryAfter: 0 };
}

export const AUTH_LIMITS = {
	login: { prefix: 'login', windowSeconds: 900, maxAttempts: 10 },
	register: { prefix: 'register', windowSeconds: 3600, maxAttempts: 5 },
	passwordReset: { prefix: 'pw-reset', windowSeconds: 3600, maxAttempts: 5 },
	resetToken: { prefix: 'pw-token', windowSeconds: 900, maxAttempts: 10 },
} as const;
