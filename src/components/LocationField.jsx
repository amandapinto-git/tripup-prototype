import { useEffect, useRef, useState } from 'react';
import { MapPin, CircleNotch } from '@phosphor-icons/react';
import UnderlineField, { underlineInputStyle } from './UnderlineField';

// Real place search via OpenStreetMap's Nominatim (no API key needed) — a
// stand-in for whatever places API a production build would use, but an
// actual network-backed one rather than a mocked list.
function shortLabel(place) {
  const parts = place.display_name.split(',').map((p) => p.trim());
  return parts.slice(0, 3).join(', ');
}

export default function LocationField({ value, onChange }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    debounceRef.current = setTimeout(async () => {
      if (value.trim().length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data);
      } catch {
        // A dropped request (typed over) or offline network — leave
        // whatever results are already showing rather than erroring out.
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [value]);

  return (
    <div style={{ position: 'relative' }}>
      <UnderlineField label="Location">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? (
            <CircleNotch size={16} color="var(--ink-mute)" className="spin" style={{ flexShrink: 0 }} />
          ) : (
            <MapPin size={16} weight={value ? 'fill' : 'regular'} color="var(--ink-mute)" style={{ flexShrink: 0 }} />
          )}
          <input
            placeholder="Search for a place"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            className="poll-underline-input"
            style={underlineInputStyle()}
          />
        </div>
      </UnderlineField>

      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 6,
            background: '#fff',
            border: '1px solid var(--border-soft)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 10,
          }}
        >
          {results.map((place) => (
            <button
              key={place.place_id}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(shortLabel(place));
                setResults([]);
                setOpen(false);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderBottom: '1px solid var(--border-soft)',
              }}
            >
              <MapPin size={14} color="var(--ink-mute)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {shortLabel(place)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
