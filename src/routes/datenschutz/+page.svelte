<script lang="ts">
import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
</script>

<svelte:head>
	<title>Datenschutzerklärung – werk.review</title>
</svelte:head>

<Breadcrumbs items={[
	{ label: 'Datenschutz' },
]} />

<article class="legal-page">
	<h1>Datenschutzerklärung</h1>
	
	<section>
		<h2>1. Datenschutz auf einen Blick</h2>
		<h3>Allgemeine Hinweise</h3>
		<p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
	</section>

	<section>
		<h2>2. Datenerfassung auf dieser Website</h2>
		<h3>Cookies und lokale Speicherung</h3>
		<p>Diese Website verwendet Session-Cookies und ähnliche Technologien zur technischen Bereitstellung der Funktionen (z. B. Login und Benutzersitzungen). Diese sind für den Betrieb der Seite technisch notwendig ("strictly necessary"). Wir verwenden keine Tracking- oder Werbe-Cookies.</p>
		
		<h3>Registrierung und Benutzerkonten</h3>
		<p>Wenn Sie ein Konto auf unserer Website erstellen, speichern wir Ihre E-Mail-Adresse und Ihren Benutzernamen, um Ihnen die Nutzung unserer interaktiven Funktionen (wie das Schreiben von Bewertungen und das Speichern von Lesezeichen) zu ermöglichen. Die Speicherung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit widerrufen können (Konto löschen).</p>

		<h3>Nutzergenerierte Inhalte</h3>
		<p>Wenn Sie Werke bewerten oder kommentieren, werden diese Daten in unserer Datenbank (Cloudflare D1) gespeichert und öffentlich auf der Plattform angezeigt. Sie können Ihre eigenen Bewertungen jederzeit über Ihr Konto bearbeiten oder löschen.</p>
	</section>

	<section>
		<h2>3. Dienste von Drittanbietern</h2>
		<h3>Wikimedia Bilder</h3>
		<p>Zur Darstellung von Autorenporträts binden wir Bilder von Wikimedia Commons (Wikimedia Foundation Inc.) ein. Beim Aufruf einer Seite mit einem solchen Bild wird Ihre IP-Adresse an die Server von Wikimedia übertragen. Dies ist zur Darstellung der Inhalte technisch notwendig (Art. 6 Abs. 1 lit. f DSGVO).</p>

		<h3>LibriVox Hörbücher</h3>
		<p>Wenn Sie auf der Seite eines Werkes die Abspielfunktion für ein Hörbuch nutzen, wird eine Verbindung zu den Servern von LibriVox (bzw. Internet Archive) aufgebaut, um die Audiodatei abzurufen. Dabei wird Ihre IP-Adresse übertragen. Die Übertragung erfolgt erst, wenn Sie aktiv auf "Play" drücken (Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO).</p>
	</section>

	<section>
		<h2>4. Hosting und Content Delivery Networks (CDN)</h2>
		<h3>Cloudflare</h3>
		<p>Wir hosten unsere Website bei Cloudflare. Anbieter ist die Cloudflare Inc., 101 Townsend St., San Francisco, CA 94107, USA. Wenn Sie unsere Website besuchen, werden Ihre Anfragen über die Server von Cloudflare geleitet (Content Delivery Network). Dabei erfasst Cloudflare standardmäßig Zugriffsdaten wie Ihre IP-Adresse, um die Sicherheit und Erreichbarkeit unserer Website zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO).</p>
	</section>

	<section>
		<h2>5. Ihre Rechte</h2>
		<p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Da Sie über Ihr Konto alle Daten selbst verwalten oder das Konto vollständig löschen können, haben Sie direkte Kontrolle über Ihre Daten.</p>
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

	h3 {
		font-family: var(--font-ui);
		font-size: 1.1rem;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	p {
		margin-bottom: 1rem;
		color: var(--color-text);
	}
</style>
