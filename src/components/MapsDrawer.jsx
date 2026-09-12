import { X, MapTrifold, NavigationArrow, Compass } from '@phosphor-icons/react';

const APPS = [
  {
    id: 'apple',
    name: 'Apple Maps',
    color: '#000',
    Icon: Compass,
    url: (q) => `https://maps.apple.com/?q=${q}`,
  },
  {
    id: 'google',
    name: 'Google Maps',
    color: '#1a73e8',
    Icon: MapTrifold,
    url: (q) => `https://www.google.com/maps/search/?api=1&query=${q}`,
  },
  {
    id: 'waze',
    name: 'Waze',
    color: '#33ccff',
    Icon: NavigationArrow,
    url: (q) => `https://waze.com/ul?q=${q}&navigate=yes`,
  },
];

export default function MapsDrawer({ place, onClose }) {
  if (!place) return null;

  const query = encodeURIComponent(place);

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row-between" style={{ marginBottom: 20 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)' }}>Get directions to</p>
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
              {place}
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
              href={url(query)}
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
