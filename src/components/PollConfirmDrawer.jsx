import { useState } from 'react';
import { X, ArrowSquareOut } from '@phosphor-icons/react';
import { useTripDispatch } from '../state/TripContext';
import { pollWinner, resolveLocation, resolveReservation } from '../utils/polls';
import LocationField from './LocationField';

export default function PollConfirmDrawer({ tripId, poll, onClose, onConfirmed }) {
  const dispatch = useTripDispatch();
  const winner = pollWinner(poll);
  const match = winner ? resolveLocation(winner.text) : null;
  const [step, setStep] = useState(match ? 'match' : 'manual');
  const [manualValue, setManualValue] = useState(winner?.text || '');
  const [location, setLocation] = useState(null);

  if (!poll || !winner) return null;

  const toActionsStep = (loc) => {
    setLocation(loc);
    setStep('actions');
  };

  const addToItinerary = () => {
    dispatch({ type: 'CONFIRM_POLL', tripId, pollId: poll.id, location });
    onClose();
    onConfirmed?.();
  };

  const discard = () => {
    dispatch({ type: 'DISCARD_POLL', tripId, pollId: poll.id });
    onClose();
  };

  const reservationUrl = location ? resolveReservation(winner.text) : null;
  const reservationSearchUrl = location
    ? `https://www.google.com/search?q=${encodeURIComponent(`${location.name} reservations`)}`
    : null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <p className="section-title">{poll.title}</p>
          <button className="icon-btn" style={{ flexShrink: 0 }} onClick={onClose}>
            <X size={16} weight="bold" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {step === 'match' && (
            <>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Is {match.name} the right spot?</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid var(--border-soft)', borderRadius: 12, padding: 10 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    flexShrink: 0,
                    backgroundImage: `url(${match.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {match.name}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--ink-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {match.address}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => toActionsStep(match)}>
                  Yes, that's it
                </button>
                <button className="btn btn-outline" onClick={() => setStep('manual')}>
                  Not quite, let me fix it
                </button>
              </div>
            </>
          )}

          {step === 'manual' && (
            <>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {match ? "What's the right location?" : `Where is "${winner.text}"?`}
              </p>
              <LocationField value={manualValue} onChange={setManualValue} />
              <button
                className="btn btn-primary"
                disabled={!manualValue.trim()}
                onClick={() => toActionsStep({ name: manualValue.trim() })}
              >
                Confirm
              </button>
            </>
          )}

          {step === 'actions' && (
            <>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{location.name} is set — what's next?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href={reservationUrl || reservationSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  {reservationUrl ? 'Book now' : 'Search for reservations'} <ArrowSquareOut size={14} weight="bold" />
                </a>
                <button className="btn btn-outline" onClick={addToItinerary}>
                  Add to itinerary
                </button>
                <button className="btn btn-outline" style={{ color: 'var(--danger)' }} onClick={discard}>
                  Discard poll
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
