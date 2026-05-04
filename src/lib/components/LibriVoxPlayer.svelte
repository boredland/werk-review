<script lang="ts">
import { onMount } from 'svelte';

let { librivoxId, workTitles = [] } = $props<{
	librivoxId: string;
	workTitles?: string[];
}>();

interface Section {
	id: string;
	section_number: string;
	title: string;
	listen_url: string;
	playtime: string;
}

let book: { title: string; url_librivox: string; sections: Section[] } | null = $state(null);
let loading = $state(true);
let error = $state('');

let currentSection: Section | null = $state(null);

onMount(async () => {
	try {
		const res = await fetch(`/api/librivox/${librivoxId}`);
		if (!res.ok) throw new Error('API Fehler');
		const data = (await res.json()) as {
			books?: { title: string; url_librivox: string; sections: Section[] }[];
		};
		if (!data.books || data.books.length === 0) throw new Error('Nicht gefunden');

		book = data.books[0];
	} catch (e) {
		console.error('LibriVox fetch error:', e);
		error = 'Fehler beim Laden des Hörbuchs.';
	} finally {
		loading = false;
	}
});

function normalize(str: string) {
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

function isRelevant(sectionTitle: string) {
	if (workTitles.length === 0) return true;
	const nLv = normalize(sectionTitle);

	for (const t of workTitles) {
		const nWork = normalize(t);
		if (nWork === nLv) return true;
		if (nWork.length > 5 && (nLv.includes(nWork) || nWork.includes(nLv))) return true;

		const simplify = (s: string) =>
			s
				.replace(/^(die|der|das|ein|eine|auswahl aus|erzaehlungen aus|novellen) /g, '')
				.replace(/ teil i+$/g, '')
				.replace(/ \d+$/g, '')
				.trim();

		const sWork = simplify(nWork);
		const sLv = simplify(nLv);

		if (sWork.length > 3 && (sWork === sLv || sLv.includes(sWork) || sWork.includes(sLv)))
			return true;
	}
	return false;
}
</script>

<div class="player-container">
	{#if loading}
		<p class="loading">Lade Hörbuch-Daten...</p>
	{:else if error}
		<p class="error">{error}</p>
	{:else if book}
		<div class="player-header">
			<h4>LibriVox Player: {book.title}</h4>
			{#if book.url_librivox}
				<a href={book.url_librivox} target="_blank" rel="noopener" class="header-link" title="Zur LibriVox-Seite">
					↗ LibriVox
				</a>
			{/if}
		</div>

		{#if currentSection}
			<div class="active-player">
				<p class="now-playing">
					<span>Spielt jetzt:</span> {currentSection.title}
				</p>
				<!-- svelte-ignore a11y_media_has_caption -->
				<audio controls src={currentSection.listen_url} autoplay>
					Dein Browser unterstützt kein Audio.
				</audio>
			</div>
		{/if}

		<ul class="section-list">
			{#each book.sections as section}
				{@const relevant = isRelevant(section.title)}
				<li class="section-item" class:is-relevant={relevant} class:is-active={currentSection?.id === section.id}>
					<button class="play-btn" onclick={() => currentSection = section}>
						{currentSection?.id === section.id ? '⏸' : '▶'}
					</button>
					<div class="section-info">
						<span class="section-title">{section.title}</span>
						{#if section.playtime}
							<span class="section-time">{Math.floor(parseInt(section.playtime) / 60)}:{parseInt(section.playtime) % 60 < 10 ? '0' : ''}{parseInt(section.playtime) % 60} Min.</span>
						{/if}
					</div>
					<a 
						href={section.listen_url} 
						download 
						target="_blank"
						rel="noopener"
						class="download-btn"
						title="MP3 herunterladen"
					>
						↓
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.player-container {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		margin-bottom: 2rem;
		border-radius: 4px;
		overflow: hidden;
	}

	.player-header {
		padding: 1rem;
		background: var(--color-surface-warm);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	.player-header h4 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
		color: var(--color-accent);
	}

	.header-link {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		text-decoration: none;
		white-space: nowrap;
	}

	.header-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.loading, .error {
		padding: 1.5rem;
		text-align: center;
		font-family: var(--font-ui);
		color: var(--color-text-muted);
	}

	.error {
		color: red;
	}

	.active-player {
		padding: 1rem;
		background: var(--color-gold-light);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.active-player audio {
		width: 100%;
		height: 40px;
	}

	.now-playing {
		margin: 0;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.now-playing span {
		color: var(--color-text-muted);
		text-transform: uppercase;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
	}

	.section-list {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 400px;
		overflow-y: auto;
	}

	.section-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border-light);
		background: var(--color-surface);
		transition: background 0.15s;
	}

	.section-item:last-child {
		border-bottom: none;
	}

	.section-item:hover {
		background: var(--color-surface-warm);
	}

	.section-item.is-relevant {
		border-left: 3px solid var(--color-gold);
		padding-left: calc(1rem - 3px);
	}

	.section-item.is-active {
		background: var(--color-gold-light);
	}

	.play-btn {
		background: var(--color-accent);
		color: white;
		border: none;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.8rem;
		flex-shrink: 0;
	}

	.play-btn:hover {
		opacity: 0.9;
	}

	.section-info {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.section-title {
		font-family: var(--font-ui);
		font-size: 0.9rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.section-time {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.download-btn {
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		border-radius: 4px;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 1.1rem;
		text-decoration: none;
	}

	.download-btn:hover {
		border-color: var(--color-text);
		color: var(--color-text);
	}
</style>
