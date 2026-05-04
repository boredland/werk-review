<script lang="ts">
let { data } = $props();
</script>

<svelte:head>
	<title>Admin – werk.review</title>
</svelte:head>

<h1>Administration</h1>

<div class="admin-grid">
	<a href="/admin/vorschlaege" class="admin-card">
		<span class="admin-card-icon">&#9998;</span>
		<div class="admin-card-body">
			<h2>Autorenvorschläge</h2>
			<p>Vorschläge von Nutzern prüfen und verwalten</p>
			{#if data.pendingSuggestions > 0}
				<span class="admin-badge">{data.pendingSuggestions} ausstehend</span>
			{/if}
		</div>
	</a>

	<a href="/admin/nutzer" class="admin-card">
		<span class="admin-card-icon">&#128101;</span>
		<div class="admin-card-body">
			<h2>Nutzerverwaltung</h2>
			<p>Nutzer anzeigen, sperren oder löschen</p>
		</div>
	</a>
</div>

<section class="admin-stats">
	<h2>Übersicht</h2>
	<dl class="stats-grid">
		<div class="stat-item">
			<dt>Nutzer</dt>
			<dd>{data.userCount}</dd>
		</div>
		<div class="stat-item">
			<dt>Bewertungen</dt>
			<dd>{data.reviewCount}</dd>
		</div>
		<div class="stat-item">
			<dt>Vorschläge</dt>
			<dd>{data.suggestionCount}</dd>
		</div>
	</dl>
</section>

<style>
	.admin-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
		margin-bottom: 3rem;
	}

	.admin-card {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		text-decoration: none;
		color: var(--color-text);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.admin-card:hover {
		border-color: var(--color-accent);
		box-shadow: 0 2px 12px rgba(123, 45, 59, 0.08);
		text-decoration: none;
	}

	.admin-card-icon {
		font-size: 1.8rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.admin-card-body h2 {
		font-size: 1.1rem;
		margin: 0 0 0.25rem;
	}

	.admin-card-body p {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.admin-badge {
		display: inline-block;
		margin-top: 0.5rem;
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
		color: var(--color-gold);
		background: var(--color-gold-light);
		border: 1px solid rgba(184, 150, 62, 0.3);
	}

	.admin-stats {
		border-top: 1px solid var(--color-border);
		padding-top: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 0.75rem;
		margin: 0;
	}

	.stat-item {
		padding: 1.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		text-align: center;
	}

	.stat-item dt {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-bottom: 0.35rem;
	}

	.stat-item dd {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 600;
		color: var(--color-accent);
		margin: 0;
	}
</style>
