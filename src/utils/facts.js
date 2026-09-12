// Real background on a place via Wikipedia's public search + summary APIs
// (no key needed) — resolves a loose place name to the closest matching
// article, then pulls its summary extract.
const cache = new Map();

export async function fetchLocationFacts(query) {
  if (cache.has(query)) return cache.get(query);

  const promise = (async () => {
    try {
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
      );
      const searchData = await searchRes.json();
      const title = searchData.query?.search?.[0]?.title;
      if (!title) return null;

      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      const summaryData = await summaryRes.json();
      if (!summaryData.extract) return null;

      return {
        title: summaryData.title,
        extract: summaryData.extract,
        url: summaryData.content_urls?.desktop?.page,
      };
    } catch {
      return null;
    }
  })();

  cache.set(query, promise);
  return promise;
}
