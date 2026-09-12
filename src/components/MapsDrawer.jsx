import { X, MapTrifold, NavigationArrow, Compass } from '@phosphor-icons/react';

export default function MapsDrawer({ place, onClose }) {
  if (!place) return null;

  // `place` is either a plain string (single-location search, e.g. tapping
  // an itinerary item) or { origin, destination } (the transit arrow
  // between two stops) — the latter gets real turn-by-turn directions
  // instead of just a destination pin.
  const destination = typeof place === 'object' ? place.destination : place;
  const origin = typeof place === 'object' ? place.origin : null;
  if (!destination) return null;

  const dq = encodeURIComponent(destination);
  const oq = origin ? encodeURIComponent(origin) : null;

  const APPS = [
    {
      id: 'apple',
      name: 'Apple Maps',
      color: '#000',
      Icon: Compass,
      url: oq ? `https://maps.apple.com/?saddr=${oq}&daddr=${dq}&dirflg=d` : `https://maps.apple.com/?q=${dq}`,
    },
    {
      id: 'google',
      name: 'Google Maps',
      color: '#1a73e8',
      Icon: MapTrifold,
      url: oq
        ? `https://www.google.com/maps/dir/?api=1&origin=${oq}&destination=${dq}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${dq}`,
    },
    {
      id: 'waze',
      name: 'Waze',
      color: '#33ccff',
      Icon: NavigationArrow,
      // Waze always routes from the device's current location — it has no
      // "from X" parameter, so a route request still only carries the
      // destination here.
      url: `https://waze.com/ul?q=${dq}&navigate=yes`,
    },
  ];

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row-between" style={{ marginBottom: 20 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)' }}>
              {origin ? 'Get directions' : 'Get directions to'}
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 18,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {origin ? `${origin} → ${destination}` : destination}
            </p>
          </div>
          <button className="icon-btn" style={{ flexShrink: 0 }} onClick={onClose}>
            <X size={16} weight="bold" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {APPS.map(({ id, name, color, Icon, url }) => (
            <a
              key={id}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="list-row"
              style={{ marginTop: 0, textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color="#fff" weight="fill" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
              </div>
              <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Open</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
