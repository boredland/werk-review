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
	readers?: { display_name: string }[];
}

let book: { title: string; url_librivox: string; sections: Section[] } | null = $state(null);
let loading = $state(true);
let error = $state('');

let currentSection: Section | null = $state(null);
let audioLoading = $state(false);

const readers = $derived.by(() => {
	if (!book) return [];
	const names = new Set<string>();
	for (const section of book.sections) {
		for (const reader of section.readers || []) {
			if (reader.display_name) {
				names.add(reader.display_name);
			}
		}
	}
	return Array.from(names);
});

function playNext() {
	if (!book || !currentSection) return;
	const currentIndex = book.sections.findIndex((s) => s.id === currentSection?.id);
	if (currentIndex !== -1 && currentIndex < book.sections.length - 1) {
		audioLoading = true;
		currentSection = book.sections[currentIndex + 1];
	}
}

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

<div class="librivox-wrapper">
	{#if loading}
		<div class="player-container loading-state">
			<span class="spinner loading-spinner"></span>
			<p class="loading">Lade Hörbuch-Daten...</p>
		</div>
	{:else if error}
		<div class="player-container">
			<p class="error">{error}</p>
		</div>
	{:else if book}
		<details class="player-container">
			<summary class="player-header">
				<div class="header-main">
					<span class="link-format">Hörbuch</span>
					<h4>{book.title}</h4>
					{#if readers.length > 0}
						<span class="readers">Gelesen von {readers.join(', ')}</span>
					{/if}
				</div>
				<div class="header-actions">
					{#if book.url_librivox}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<a 
							href={book.url_librivox} 
							target="_blank" 
							rel="noopener" 
							class="header-link" 
							title="Zur LibriVox-Seite"
							onclick={(e) => e.stopPropagation()}
						>
							↗ LibriVox
						</a>
					{/if}
					<span class="details-icon"></span>
				</div>
			</summary>

			<div class="player-content">
				{#if currentSection}
					<div class="active-player">
						<p class="now-playing">
							<span>Spielt jetzt:</span> {currentSection.title}
						</p>
						<!-- svelte-ignore a11y_media_has_caption -->
						<audio 
							controls 
							src={currentSection.listen_url} 
							autoplay 
							onended={playNext}
							onwaiting={() => audioLoading = true}
							onplaying={() => audioLoading = false}
							oncanplay={() => audioLoading = false}
							onerror={() => audioLoading = false}
						>
							Dein Browser unterstützt kein Audio.
						</audio>
					</div>
				{/if}

				<ul class="section-list">
					{#each book.sections as section}
						{@const relevant = isRelevant(section.title)}
						<li class="section-item" class:is-relevant={relevant} class:is-active={currentSection?.id === section.id}>
							<button 
								class="play-btn" 
								onclick={() => {
									if (currentSection?.id !== section.id) audioLoading = true;
									currentSection = section;
								}}
							>
								{#if currentSection?.id === section.id}
									{#if audioLoading}
										<span class="spinner"></span>
									{:else}
										⏸
									{/if}
								{:else}
									▶
								{/if}
							</button>
							<div class="section-info">
								<span class="section-title">{section.title}</span>
								{#if section.playtime}
									<span class="section-time">{Math.floor(parseInt(section.playtime) / 60)}:{parseInt(section.playtime) % 60 < 10 ? '0' : ''}{parseInt(section.playtime) % 60} Min.</span>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</details>
	{/if}
</div>

<style>
	.librivox-wrapper {
		height: 100%;
	}

	.player-container {
		height: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 4px;
		overflow: hidden;
		transition: border-color 0.2s;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		gap: 1rem;
	}

	.loading-spinner {
		border-color: var(--color-border);
		border-top-color: var(--color-accent);
		width: 24px;
		height: 24px;
	}

	/* details/summary styling */
	summary {
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}

	.player-header {
		padding: 0.85rem 1rem;
		background: var(--color-surface);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		cursor: pointer;
		user-select: none;
		transition: border-color 0.2s;
	}

	.player-container:hover {
		border-color: var(--color-accent);
	}

	details[open] .player-header {
		border-bottom: 1px solid var(--color-border-light);
	}

	.header-main {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.link-format {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-gold);
	}

	.header-main h4 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-main h4::first-letter {
		text-transform: uppercase;
	}

	.readers {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-shrink: 0;
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

	.details-icon {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-right: 2px solid var(--color-text-muted);
		border-bottom: 2px solid var(--color-text-muted);
		transform: rotate(45deg);
		transition: transform 0.2s;
	}

	details[open] .details-icon {
		transform: rotate(225deg);
		margin-top: 4px;
	}

	.loading, .error {
		margin: 0;
		text-align: center;
		font-family: var(--font-ui);
		color: var(--color-text-muted);
	}

	.error {
		color: red;
		padding: 1.5rem;
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

	.spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
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
</style>