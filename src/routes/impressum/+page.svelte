<script lang="ts">
import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
</script>

<svelte:head>
	<title>Impressum – werk.review</title>
</svelte:head>

<Breadcrumbs items={[
	{ label: 'Impressum' },
]} />

<article class="legal-page">
	<h1>Impressum</h1>

	<section>
		<h2>Angaben gemäß § 5 TMG (Digitale-Dienste-Gesetz)</h2>
		<p>
			<strong>Jonas Strassel</strong><br />
			Am Kappelgarten 24<br />
			60389 Frankfurt<br />
			Deutschland
		</p>
	</section>

	<section>
		<h2>Kontakt</h2>
		<p>
			E-Mail: kontakt@werk.review
		</p>
	</section>

	<section>
		<h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
		<p>
			Jonas Strassel<br />
			Am Kappelgarten 24<br />
			60389 Frankfurt
		</p>
	</section>

	<section>
		<h2>Streitschlichtung</h2>
		<p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr</a>.<br />
		Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
	</section>

	<section>
		<h2>Urheberrecht</h2>
		<p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
		<p><strong>Bilder und Metadaten:</strong> Autorenfotos stammen, sofern nicht anders angegeben, von Wikimedia Commons. Buchinhalte und Metadaten stammen aus öffentlich zugänglichen Quellen oder der Deutschen Nationalbibliothek.</p>
	</section>
</article>

<style>
	.legal-page {
		max-width: 800px;
		margin: 0 auto;
		line-height: 1.7;
	}

	h1 {
		margin-bottom: 2rem;
	}

	section {
		margin-bottom: 2.5rem;
	}

	h2 {
		font-family: var(--font-display);
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: var(--color-accent);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.5rem;
	}

	p {
		margin-bottom: 1rem;
		color: var(--color-text);
	}
</style>
