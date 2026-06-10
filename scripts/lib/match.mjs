// Title-matching shared by the link enrichment and one-off maintenance scripts.
// The goal is to decide whether a LibriVox book (or one of its section titles)
// actually refers to a given work. Earlier versions matched on raw substrings,
// which let a short work title like "Acte" match inside an unrelated section
// word like "char-acte-r" and spam every author's works. Matching is therefore
// anchored to whole words and shared significant tokens.

// Articles, helpers and edition/format noise that carry no identifying signal.
const STOP = new Set(
	(
		'die der das ein eine und oder von vom zu zur zum auf aus im in an als bei mit nach ' +
		'the of a an and or to le la les un une de des du et ou ' +
		'jahr teil band buch erste zweite dritte vierte fassung version dramatic reading ' +
		'auswahl novellen erzaehlungen erzaehlung roman novelle hoerbuch'
	).split(' '),
);

export function normalize(str) {
	if (!str) return '';
	return str
		.toLowerCase()
		.replace(/ß/g, 'ss')
		.replace(/mmm/g, 'mm')
		.replace(/nnn/g, 'nn')
		.replace(/[^a-z0-9]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function sigTokens(normalized) {
	return normalized.split(' ').filter((t) => t.length >= 4 && !STOP.has(t));
}

function phraseIncludes(haystack, needle) {
	if (!needle) return false;
	const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`(^| )${escaped}( |$)`).test(haystack);
}

export function isMatch(work, candidateTitle) {
	const nCand = normalize(candidateTitle);
	if (!nCand) return false;
	const candSig = new Set(sigTokens(nCand));

	for (const t of [work.title, ...(work.aliases || [])]) {
		const nWork = normalize(t);
		if (!nWork) continue;

		if (nWork === nCand) return true;

		// Whole-phrase containment in either direction (e.g. a story title fully
		// present in a collection audiobook's section title).
		const workHasSig = sigTokens(nWork).length > 0;
		if (workHasSig && nWork.length >= 5 && phraseIncludes(nCand, nWork)) return true;
		if (workHasSig && nCand.length >= 5 && phraseIncludes(nWork, nCand)) return true;

		// Two or more distinct shared significant tokens — robust to word order
		// and minor edition differences without the false positives of substring
		// matching. Distinct is essential: a slash-joined alias may repeat a word
		// (e.g. "...von Paris / ...de Paris") which must not count twice.
		const workSig = new Set(sigTokens(nWork));
		let shared = 0;
		for (const x of workSig) if (candSig.has(x)) shared++;
		if (shared >= 2) return true;
	}
	return false;
}
