<svelte:head>
	<title>Über uns – werk.review</title>
</svelte:head>

<div class="about-page">
	<h1>Über uns</h1>

	<div class="content">
		<p class="lead">
			<strong>werk.review</strong> ist ein Projekt zur Erfassung und Bewertung
			von Werken der klassischen deutschsprachigen Literatur.
		</p>
		<p>
			Unser Ziel ist es, einen umfassenden Überblick über Autoren, ihre Werke und deren Einordnung in
			literarische Genres zu bieten. Registrierte Nutzer können Werke bewerten und so eine
			gemeinschaftliche Einschätzung der Literatur ermöglichen.
		</p>

		<h2>Funktionen</h2>
		<ul>
			<li>Umfangreiche Datenbank mit Autoren und deren Werken</li>
			<li>Sortierung nach Genres und Entstehungszeitraum</li>
			<li>Bewertungssystem für registrierte Nutzer</li>
			<li>Volltextsuche über Autoren, Werke und Genres</li>
		</ul>

		<h2>Kontakt</h2>
		<p>
			Bei Fragen oder Anregungen erreichen Sie uns unter
			<a href="mailto:kontakt@werk.review">kontakt@werk.review</a>.
		</p>
	</div>
</div>

<style>
	.about-page {
		max-width: 680px;
	}

	.content {
		line-height: 1.75;
	}

	.lead {
		font-size: 1.1rem;
		line-height: 1.7;
	}

	.content ul {
		padding-left: 1.25rem;
		list-style: none;
	}

	.content li {
		margin-bottom: 0.5rem;
		padding-left: 0.75rem;
		position: relative;
	}

	.content li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.65em;
		width: 5px;
		height: 5px;
		background: var(--color-accent);
	}
</style>
