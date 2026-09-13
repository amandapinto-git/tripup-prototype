// Real background on a place via Wikipedia's public search + summary APIs
// (no key needed). Plain full-text search alone is unreliable for small or
// lesser-known places — it can match an unrelated article that merely
// shares a word with the query (e.g. a person's name for a small
// restaurant), which is how "Taberna Ideal" once surfaced a Diane Lane
// biography. This looks for a real nearby landmark first (geosearch
// anchored on the place's actual geocoded coordinates), and never accepts
// a candidate — from either geosearch or text search — unless it shares a
// meaningful word with the query. When nothing relevant is found, no facts
// are shown rather than a wrong one.
import { geocode } from './transit';

const cache = new Map();

const STOPWORDS = new Set(['the', 'and', 'of', 'at', 'in', 'on', 'de', 'da', 'do', 'das', 'dos', 'le', 'la']);

function significantWords(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9À-ÿ\s]/gi, '')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

function isRelevant(candidateTitle, query) {
  const queryWords = significantWords(query);
  const titleWords = significantWords(candidateTitle);
  if (queryWords.length === 0 || titleWords.length === 0) return false;
  return queryWords.some((w) => titleWords.includes(w));
}

async function titleFromGeosearch(query, location) {
  if (!location) return null;
  try {
    const geo = await geocode(location);
    if (!geo) return null;
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${geo.lat}|${geo.lon}&gsradius=300&gslimit=5&format=json&origin=*`
    );
    const data = await res.json();
    const candidates = data.query?.geosearch || [];
    return candidates.find((c) => isRelevant(c.title, query))?.title || null;
  } catch {
    return null;
  }
}

async function titleFromTextSearch(query) {
  const res = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=3&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
  );
  const data = await res.json();
  const candidates = data.query?.search || [];
  return candidates.find((c) => isRelevant(c.title, query))?.title || null;
}

export async function fetchLocationFacts(query, location) {
  const cacheKey = `${query}|${location || ''}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const promise = (async () => {
    try {
      const title = (await titleFromGeosearch(query, location)) || (await titleFromTextSearch(query));
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

  cache.set(cacheKey, promise);
  return promise;
}
