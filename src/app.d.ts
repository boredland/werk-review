declare global {
	namespace App {
		interface Locals {
			user: { id: string; username: string; email: string; emailVerified: boolean } | null;
		}
		interface Platform {
			env: {
				DB: D1Database;
				SESSION_KV: KVNamespace;
				IMAGES: R2Bucket;
				EMAIL: SendEmail;
				PUBLIC_SITE_URL: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
	}
}

export {};
