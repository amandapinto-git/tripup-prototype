// Real transit estimate between two stops: geocode both via Nominatim
// (OpenStreetMap, no key needed — same one LocationField already uses),
// then either estimate a walk from straight-line distance or fetch an
// actual driving route from OSRM's public router, so the mode/time shown
// reflects the real places involved instead of a hardcoded mock.
const WALK_THRESHOLD_METERS = 1600; // ~1 mile — below this, Maps apps default to walking directions
const WALK_SPEED_MPS = 1.35; // ~3mph, a relaxed walking pace
const WALK_PATH_INFLATION = 1.3; // real streets aren't a straight line

const geocodeCache = new Map();
const transitCache = new Map();

async function geocode(address) {
  if (geocodeCache.has(address)) return geocodeCache.get(address);
  const promise = (async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await res.json();
      if (!data[0]) return null;
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch {
      return null;
    }
  })();
  geocodeCache.set(address, promise);
  return promise;
}

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function drivingRoute(a, b) {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`
    );
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;
    return { distanceMeters: route.distance, durationSeconds: route.duration };
  } catch {
    return null;
  }
}

function formatDuration(seconds) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}m`;
}

function formatDistance(meters) {
  return `${(meters / 1609.34).toFixed(1)}mi`;
}

// Returns { mode: 'walk' | 'car', duration: 'Xm', distance: 'X.Xmi' }, or
// null if either place couldn't be located.
export async function estimateTransit(originLabel, destLabel) {
  const cacheKey = `${originLabel}→${destLabel}`;
  if (transitCache.has(cacheKey)) return transitCache.get(cacheKey);

  const promise = (async () => {
    const [origin, dest] = await Promise.all([geocode(originLabel), geocode(destLabel)]);
    if (!origin || !dest) return null;

    const straightLine = haversineMeters(origin, dest);
    if (straightLine <= WALK_THRESHOLD_METERS) {
      const walkDistance = straightLine * WALK_PATH_INFLATION;
      return {
        mode: 'walk',
        duration: formatDuration(walkDistance / WALK_SPEED_MPS),
        distance: formatDistance(walkDistance),
      };
    }

    const driving = await drivingRoute(origin, dest);
    if (!driving) return null;
    return {
      mode: 'car',
      duration: formatDuration(driving.durationSeconds),
      distance: formatDistance(driving.distanceMeters),
    };
  })();

  transitCache.set(cacheKey, promise);
  return promise;
}
