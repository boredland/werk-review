<script lang="ts">
interface Props {
	icon?: string;
	message: string;
}

let { icon = '📖', message }: Props = $props();
</script>

<div class="empty-state">
	<div class="empty-icon">{icon}</div>
	<p class="empty-message">{message}</p>
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3rem 1.5rem;
		text-align: center;
	}

	.empty-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.empty-message {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		font-size: 0.95rem;
		margin: 0;
		max-width: 320px;
		line-height: 1.5;
	}
</style>
