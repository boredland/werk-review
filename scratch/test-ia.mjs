async function test() {
    const authorName = "Gottfried Keller";
    const title = "Kleider machen Leute";
    const videoQuery = `(("${authorName}") AND ("${title}")) AND mediatype:(movies OR video)`;
    const videoParams = new URLSearchParams({
        q: videoQuery,
        fl: 'identifier,title,mediatype',
        output: 'json',
        rows: '3',
    });
    const url = `https://archive.org/advancedsearch.php?${videoParams}`;
    console.log('Fetching:', url);
    const res = await fetch(url);
    const data = await res.json();
    console.log('Results:', JSON.stringify(data.response.docs, null, 2));
}
test();
