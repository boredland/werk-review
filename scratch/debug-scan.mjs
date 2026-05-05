
// No import needed

function normalize(str) {
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

async function testScan(authorSlug, title, lastName) {
    const authorPageUrl = `https://projekt-gutenberg.org/authors/${authorSlug}/`;
    console.log(`Fetching ${authorPageUrl}`);
    const res = await fetch(authorPageUrl);
    const html = await res.text();
    
    const bookLinkPattern = new RegExp(`href="(https:\\/\\/projekt-gutenberg\\.org\\/authors\\/${authorSlug}\\/books\\/[^"]*)"`, 'g');
    const matches = [...new Set([...html.matchAll(bookLinkPattern)].map((m) => m[1]))];
    
    console.log(`Found ${matches.length} book links on author page.`);
    
    const nWork = normalize(title);
    console.log(`Searching for normalized work: "${nWork}"`);

    const pageMatch = matches.find((m) => {
        const slug = m.toLowerCase().split('/').filter(Boolean).pop();
        // Remove author prefixes to get the "clean" book slug
        const cleanSlug = slug
            .replace(`${authorSlug}-`, '')
            .replace(`g-${lastName}-`, '')
            .replace(/-/g, ' ');
        
        const nSlug = normalize(cleanSlug);
        console.log(` - Comparing with "${nSlug}" (original: ${slug})`);
        
        return nSlug.includes(nWork) || nWork.includes(nSlug);
    });

    console.log(`RESULT: ${pageMatch || 'NONE'}`);
}

testScan('gottfried-keller', 'Das verlorene Lachen', 'keller');
