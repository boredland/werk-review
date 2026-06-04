import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RECHECK_DAYS = Number(process.env.RECHECK_DAYS) || 30;

function workHash(work) {
	return createHash('sha1')
		.update(`${work.title}|${(work.aliases || []).join(',')}`)
		.digest('hex')
		.slice(0, 12);
}

// A work is re-checked only when its title/aliases changed or its last check
// has aged past RECHECK_DAYS — so the recurring sync skips already-enriched
// works while still catching new data and dead links over time.
export function openCache(dataDir, name) {
	const path = join(dataDir, `.enrich-${name}.json`);
	let data = {};
	if (existsSync(path)) {
		try {
			data = JSON.parse(readFileSync(path, 'utf-8'));
		} catch {
			data = {};
		}
	}

	return {
		needsCheck(work, now) {
			const entry = data[work.slug];
			if (!entry || entry.hash !== workHash(work)) return true;
			if (!entry.at) return true;
			const ageDays = (Date.parse(now) - Date.parse(entry.at)) / 86_400_000;
			// Per-work jitter spreads re-verification across a week instead of
			// re-checking every work on the same day RECHECK_DAYS after a bulk seed.
			const jitter = parseInt(workHash(work).slice(0, 2), 16) % 7;
			return ageDays >= RECHECK_DAYS + jitter;
		},
		mark(work, now) {
			data[work.slug] = { hash: workHash(work), at: now };
		},
		prune(validSlugs) {
			for (const slug of Object.keys(data)) {
				if (!validSlugs.has(slug)) delete data[slug];
			}
		},
		save() {
			writeFileSync(path, `${JSON.stringify(data, null, '\t')}\n`);
		},
	};
}
