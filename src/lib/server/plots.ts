import { plots } from 'virtual:werk-plots';

export function getPlot(workId: string): string | null {
	return plots[workId] ?? null;
}
