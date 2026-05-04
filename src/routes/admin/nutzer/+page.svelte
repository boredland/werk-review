<script lang="ts">
import { enhance } from '$app/forms';

let { data } = $props();
</script>

<svelte:head>
	<title>Nutzerverwaltung – Admin – werk.review</title>
</svelte:head>

<h1>Nutzerverwaltung</h1>

<p class="user-count">{data.users.length} Nutzer</p>

<div class="user-table-wrap">
	<table class="user-table">
		<thead>
			<tr>
				<th>Benutzername</th>
				<th>E-Mail</th>
				<th>Status</th>
				<th>Registriert</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.users as u}
				<tr class:banned={u.banned}>
					<td class="td-username">{u.username}</td>
					<td class="td-email">{u.email}</td>
					<td>
						{#if u.banned}
							<span class="status-badge status-badge--banned">Gesperrt</span>
						{:else if u.emailVerified}
							<span class="status-badge status-badge--ok">Verifiziert</span>
						{:else}
							<span class="status-badge status-badge--pending">Ausstehend</span>
						{/if}
					</td>
					<td class="td-date">{new Date(u.createdAt).toLocaleDateString('de-DE')}</td>
					<td class="td-actions">
						{#if u.banned}
							<form method="POST" action="?/unban" use:enhance>
								<input type="hidden" name="userId" value={u.id} />
								<button type="submit" class="action-btn action-btn--unban">Entsperren</button>
							</form>
						{:else}
							<form method="POST" action="?/ban" use:enhance>
								<input type="hidden" name="userId" value={u.id} />
								<button type="submit" class="action-btn action-btn--ban">Sperren</button>
							</form>
						{/if}
						<form method="POST" action="?/deleteUser" use:enhance>
							<input type="hidden" name="userId" value={u.id} />
							<button type="submit" class="action-btn action-btn--delete">Löschen</button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.user-count {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.user-table-wrap {
		overflow-x: auto;
	}

	.user-table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-ui);
		font-size: 0.88rem;
	}

	.user-table th {
		text-align: left;
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		padding: 0.75rem 0.5rem;
		border-bottom: 2px solid var(--color-border);
	}

	.user-table td {
		padding: 0.75rem 0.5rem;
		border-bottom: 1px solid var(--color-border-light);
		vertical-align: middle;
	}

	tr.banned {
		opacity: 0.6;
	}

	.td-username {
		font-weight: 600;
	}

	.td-email {
		color: var(--color-text-muted);
	}

	.td-date {
		font-size: 0.82rem;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.td-actions {
		display: flex;
		gap: 0.35rem;
		white-space: nowrap;
	}

	.status-badge {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
	}

	.status-badge--ok {
		color: #2d6a4f;
		background: rgba(45, 106, 79, 0.1);
	}

	.status-badge--pending {
		color: var(--color-gold);
		background: var(--color-gold-light);
	}

	.status-badge--banned {
		color: var(--color-waste);
		background: rgba(158, 58, 58, 0.08);
	}

	.action-btn {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		padding: 0.2rem 0.5rem;
		border: 1px solid;
		background: transparent;
		cursor: pointer;
		transition: all 0.15s;
	}

	.action-btn--ban {
		color: var(--color-gold);
		border-color: var(--color-gold);
	}

	.action-btn--ban:hover {
		background: var(--color-gold);
		color: #fff;
	}

	.action-btn--unban {
		color: #2d6a4f;
		border-color: #2d6a4f;
	}

	.action-btn--unban:hover {
		background: #2d6a4f;
		color: #fff;
	}

	.action-btn--delete {
		color: var(--color-waste);
		border-color: var(--color-waste);
	}

	.action-btn--delete:hover {
		background: var(--color-waste);
		color: #fff;
	}
</style>
