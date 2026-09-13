import { useEffect, useState } from 'react';
import { X, NavigationArrow } from '@phosphor-icons/react';
import { fetchLocationFacts } from '../utils/facts';

export default function ItemDetailDrawer({ item, onClose, onGetDirections, onCancelItem }) {
  // undefined = not fetched yet (or still in flight), null = fetched but
  // nothing found, object = a result — distinguishing the first two lets
  // "loading" be derived instead of tracked as its own bit of state.
  const [facts, setFacts] = useState(undefined);
  const loadingFacts = Boolean(item?.location) && facts === undefined;

  useEffect(() => {
    if (!item?.location) return undefined;
    let cancelled = false;
    fetchLocationFacts(item.title).then((result) => {
      if (!cancelled) setFacts(result);
    });
    return () => {
      cancelled = true;
    };
  }, [item?.id, item?.title, item?.location]);

  if (!item) return null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>{item.time}</p>
            <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 600 }}>{item.title}</p>
          </div>
          <button className="icon-btn" style={{ flexShrink: 0 }} onClick={onClose}>
            <X size={16} weight="bold" />
          </button>
        </div>

        {item.image && (
          <div
            style={{
              width: '100%',
              height: 140,
              borderRadius: 12,
              marginBottom: 16,
              backgroundImage: `url(${item.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        {item.description && (
          <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{item.description}</p>
        )}

        {item.location && (loadingFacts || facts) && (
          <div style={{ marginBottom: 20 }}>
            <p className="section-title" style={{ marginBottom: 8 }}>Good to know</p>
            {loadingFacts ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-faint)' }}>Looking this up…</p>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{facts.extract}</p>
                {facts.url && (
                  <a
                    href={facts.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-block', marginTop: 6, fontSize: 12, fontWeight: 600, color: 'var(--ink-mute)' }}
                  >
                    Read more on Wikipedia
                  </a>
                )}
              </>
            )}
          </div>
        )}

        {item.location && (
          <button
            className="list-row"
            style={{ width: '100%', textAlign: 'left', marginBottom: 16 }}
            onClick={onGetDirections}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>Location</p>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 14,
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.location}
              </p>
            </div>
            <NavigationArrow size={16} weight="fill" style={{ flexShrink: 0, transform: 'rotate(90deg)' }} />
          </button>
        )}

        <button className="btn btn-danger" onClick={onCancelItem}>
          Cancel item
        </button>
      </div>
    </div>
  );
}
