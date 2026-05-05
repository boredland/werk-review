
// No import needed for fetch in modern Node

function normalize(s) {
	return s.toLowerCase()
		.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
		.replace(/\s{2,}/g, " ")
		.trim();
}

async function testSearch(title, authorName) {
	const params = new URLSearchParams({ s: `${title} ${authorName}` });
	const url = `https://projekt-gutenberg.org/?${params}`;
    const lastName = authorName.split(' ').pop().toLowerCase();

	console.log(`Searching: ${url}`);
	const res = await fetch(url);
	const html = await res.text();

	const linkPattern = /href="(https:\/\/projekt-gutenberg\.org\/authors\/[^"]*\/books\/[^"]*)"/g;
	const matches = [...html.matchAll(linkPattern)].map((m) => m[1]);
	
    console.log(`Found ${matches.length} candidates:`);
    matches.forEach(m => console.log(` - ${m}`));

    const match = matches.find((m) => {
        const urlLower = m.toLowerCase();
        if (!urlLower.includes(lastName)) return false;

        const nWork = normalize(title);
        // NEW LOGIC: Just check if the slug contains the normalized title parts or vice-versa
        const slug = urlLower.split('/').filter(Boolean).pop();
        const nSlug = slug.replace(/-/g, ' ');
        
        console.log(`Comparing "${nWork}" with slug "${nSlug}"`);
        
        if (nSlug.includes(nWork) || nWork.includes(nSlug)) return true;
        
        // Try fuzzy match (at least 3 words match)
        const workWords = nWork.split(' ').filter(w => w.length > 3);
        const slugWords = nSlug.split(' ').filter(w => w.length > 3);
        const common = workWords.filter(w => slugWords.includes(w));
        
        return common.length >= Math.min(workWords.length, 2);
    });

    console.log(`RESULT: ${match || 'NONE'}`);
}

testSearch('Der Landvogt von Greifensee', 'Gottfried Keller');
testSearch('Sinngedicht', 'Gottfried Keller');
