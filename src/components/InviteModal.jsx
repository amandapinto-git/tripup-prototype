import { useState } from 'react';
import { X, Link as LinkIcon, Check } from '@phosphor-icons/react';
import Avatar from './Avatar';
import { AVATAR_COLORS, YOU_ID, allMembers } from '../data/seed';
import { useTripDispatch, useTripState } from '../state/TripContext';

// Shown only when there's no real cross-trip overlap to suggest, so the
// section always has something in it rather than disappearing.
const PLACEHOLDER_FRIENDS = ['Priya', 'Sam', 'Leo', 'Frankie'];

export default function InviteModal({ trip, onClose }) {
  const dispatch = useTripDispatch();
  const { trips } = useTripState();
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState([]);

  // Anyone already sharing a different trip with you is a real, known
  // person to suggest here — no need to invite them from scratch.
  const otherTripIds = new Set(
    trips.filter((t) => t.id !== trip.id && t.members.some((m) => m.id === YOU_ID)).flatMap((t) => t.members.map((m) => m.id))
  );
  const friendsFromOtherTrips = allMembers.filter(
    (m) => m.id !== YOU_ID && otherTripIds.has(m.id) && !trip.members.some((tm) => tm.id === m.id) && !added.includes(m.id)
  );

  const addFriend = (friendName) => {
    const id = friendName.toLowerCase().replace(/\s+/g, '-');
    const color = AVATAR_COLORS[(trip.members.length + added.length) % AVATAR_COLORS.length];
    dispatch({
      type: 'ADD_MEMBER',
      tripId: trip.id,
      member: { id, name: friendName, initial: friendName[0].toUpperCase(), color },
    });
    setAdded((prev) => [...prev, id]);
    setName('');
  };

  const addExistingFriend = (member) => {
    dispatch({ type: 'ADD_MEMBER', tripId: trip.id, member });
    setAdded((prev) => [...prev, member.id]);
  };

  const removeFriend = (memberId) => {
    dispatch({ type: 'REMOVE_MEMBER', tripId: trip.id, memberId });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://tripup.app/join/${trip.id}`);
    } catch {
      // clipboard may be unavailable in some contexts
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const organiser = trip.members.find((m) => m.id === YOU_ID);
  const otherMembers = trip.members.filter((m) => m.id !== YOU_ID);

  return (
    <div className="sheet-overlay sheet-overlay-right" onClick={onClose}>
      <div className="sheet-right" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="row-between">
            <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Add a friend</p>
            <button className="icon-btn" onClick={onClose}>
              <X size={16} weight="bold" />
            </button>
          </div>

          <button className="card row-between" style={{ width: '100%', textAlign: 'left' }} onClick={copyLink}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="icon-btn" style={{ background: 'var(--surface-card)' }}>
                <LinkIcon size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Share invite link</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--ink-mute)' }}>tripup.app/join/{trip.id}</p>
              </div>
            </div>
            {copied ? <span className="toast">Copied!</span> : <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Copy</span>}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="section-title">From your trips</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {friendsFromOtherTrips.length > 0
                ? friendsFromOtherTrips.map((m) => (
                    <div key={m.id} className="list-row">
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Avatar member={m} size={32} />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</span>
                      </div>
                      <button className="btn-outline btn-sm" onClick={() => addExistingFriend(m)}>
                        Invite
                      </button>
                    </div>
                  ))
                : PLACEHOLDER_FRIENDS.filter((s) => !added.includes(s.toLowerCase())).map((s) => (
                    <div key={s} className="list-row">
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Avatar member={{ initial: s[0], color: '#c7ccd1' }} size={32} />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{s}</span>
                      </div>
                      <button className="btn-outline btn-sm" onClick={() => addFriend(s)}>
                        Invite
                      </button>
                    </div>
                  ))}
            </div>
          </div>

          <div className="field">
            <label>Or add by name</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya"
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && addFriend(name.trim())}
              />
              <button className="btn-dark-sm" disabled={!name.trim()} onClick={() => addFriend(name.trim())}>
                Add
              </button>
            </div>
          </div>

          {organiser && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p className="section-title">Organiser</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-card)', padding: '6px 10px', borderRadius: 999, alignSelf: 'flex-start' }}>
                <Avatar member={organiser} size={20} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>You</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="section-title">Already on the trip</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {otherMembers.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--surface-card)',
                    padding: '6px 8px 6px 10px',
                    borderRadius: 999,
                  }}
                >
                  <Avatar member={m} size={20} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</span>
                  {added.includes(m.id) && <Check size={12} weight="bold" color="var(--success)" />}
                  <button
                    onClick={() => removeFriend(m.id)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: 'rgba(0,0,0,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <X size={12} weight="bold" color="#000" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
