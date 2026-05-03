export const RATINGS = [
	{ value: 2, label: 'Meisterwerk', emoji: '🏆', color: 'var(--color-masterpiece)' },
	{ value: 1, label: 'Empfehlung', emoji: '👍', color: 'var(--color-recommendation)' },
	{ value: 0, label: 'Kann man lesen', emoji: '📖', color: 'var(--color-readable)' },
	{ value: -1, label: 'Zeitverschwendung', emoji: '👎', color: 'var(--color-waste)' }
] as const;

export type RatingValue = (typeof RATINGS)[number]['value'];

export function getRatingConfig(value: number) {
	return RATINGS.find((r) => r.value === value) ?? RATINGS[2];
}

export function getRatingByLabel(label: string) {
	return RATINGS.find((r) => r.label === label);
}
