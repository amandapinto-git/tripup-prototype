import { useState } from 'react';
import { Check, CheckCircle } from '@phosphor-icons/react';
import { useTripDispatch } from '../state/TripContext';
import { YOU_ID } from '../data/seed';
import { isPollClosed, pollWinner } from '../utils/polls';
import PollConfirmDrawer from './PollConfirmDrawer';
import AvatarChips from './AvatarChips';

function memberById(members, id) {
  return members.find((m) => m.id === id);
}

// The one option-field look shared by the open (voteable) and closed
// (read-only, winner highlighted) states — only the right-hand content and
// whether it's clickable differ.
function OptionField({ opt, pct, filled, onClick, right }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      style={{
        position: 'relative',
        height: 42,
        borderRadius: 14,
        border: '1px solid var(--border-soft)',
        overflow: 'hidden',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${Math.max(pct, opt.votes.length ? 14 : 0)}%`,
          background: filled ? '#000' : 'var(--surface-card)',
          transition: 'width 0.25s ease',
        }}
      />
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: filled ? '#fff' : 'var(--ink)' }}>{opt.text}</span>
        {right}
      </div>
    </Tag>
  );
}

// The scheduled time only gets its own line once it's a real time — not
// one of the placeholder strings AddPlanFlow writes when the time itself
// is still up for a vote or was never set.
const PLACEHOLDER_TIMES = ['Time TBD', 'Time: vote in progress'];

export default function PollCard({ tripId, poll, members, onConfirmed, onOpenDetail }) {
  const dispatch = useTripDispatch();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  const closed = isPollClosed(poll, members);
  const showScheduledTime = poll.time && !PLACEHOLDER_TIMES.includes(poll.time);
  const creator = memberById(members, poll.createdBy);

  const vote = (optionId) => {
    dispatch({ type: 'VOTE_POLL', tripId, pollId: poll.id, memberId: YOU_ID, optionId });
  };

  if (poll.decided) {
    const winner = pollWinner(poll);
    const voters = (winner?.votes || []).map((id) => memberById(members, id)).filter(Boolean);
    const placeName = poll.confirmedLocation?.name || winner?.text;
    const time = poll.confirmedLocation?.time;
    return (
      <button
        className="card"
        onClick={() =>
          onOpenDetail?.({
            id: poll.id,
            title: placeName,
            time,
            location: poll.confirmedLocation?.address,
          })
        }
        style={{
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {time && <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>{time}</p>}
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <CheckCircle size={16} weight="fill" color="var(--success)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 18, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {placeName}
          </span>
        </span>
        {voters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Voted by</span>
            <AvatarChips members={voters} size={18} max={5} textColor="var(--ink-mute)" />
          </div>
        )}
      </button>
    );
  }

  if (closed) {
    const winner = pollWinner(poll);
    // Either the poll's creator or the trip organiser can confirm it. This
    // prototype only ever has one interactive user ("You"), who is also
    // always the organiser (see InviteModal) — so this is always true here,
    // but it's written as the real rule rather than hardcoded to `true`.
    const YOU_IS_ORGANISER = true;
    const canConfirm = poll.createdBy === YOU_ID || YOU_IS_ORGANISER;
    return (
      <>
        <div
          style={{
            background: '#fff',
            border: '1px dashed var(--border-soft)',
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            width: '100%',
          }}
        >
          {showScheduledTime && <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>{poll.time}</p>}
          <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{poll.title}</p>
          {creator && (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
              Created by {creator.id === YOU_ID ? 'you' : creator.name}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {poll.options.map((opt) => {
              const pct = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
              const voters = opt.votes.map((id) => memberById(members, id)).filter(Boolean);
              return (
                <OptionField
                  key={opt.id}
                  opt={opt}
                  pct={pct}
                  filled={opt.id === winner?.id}
                  right={
                    voters.length > 0 ? (
                      <AvatarChips members={voters} size={20} max={5} textColor={opt.id === winner?.id ? '#fff' : 'var(--ink-mute)'} />
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>No votes</span>
                    )
                  }
                />
              );
            })}
          </div>

          {canConfirm ? (
            <button className="btn btn-primary" onClick={() => setConfirmOpen(true)}>
              Confirm the winner
            </button>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-mute)' }}>Waiting on the organiser to confirm.</p>
          )}
        </div>
        {confirmOpen && (
          <PollConfirmDrawer
            tripId={tripId}
            poll={poll}
            onClose={() => setConfirmOpen(false)}
            onConfirmed={onConfirmed}
          />
        )}
      </>
    );
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px dashed var(--border-soft)',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        width: '100%',
      }}
    >
      <div className="row-between" style={{ alignItems: 'flex-start' }}>
        <div>
          {showScheduledTime && <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>{poll.time}</p>}
          <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{poll.title}</p>
          {creator && (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>
              Created by {creator.id === YOU_ID ? 'you' : creator.name}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {poll.options.map((opt) => {
          const pct = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
          const youVoted = opt.votes.includes(YOU_ID);
          return (
            <OptionField
              key={opt.id}
              opt={opt}
              pct={pct}
              filled={youVoted}
              onClick={() => vote(opt.id)}
              right={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {totalVotes > 0 && (
                    <span style={{ fontSize: 14, fontWeight: 600, color: youVoted ? '#fff' : 'var(--ink-mute)' }}>
                      {pct}%
                    </span>
                  )}
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: `1.5px solid ${youVoted ? '#fff' : 'var(--border-soft)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {youVoted && <Check size={12} weight="bold" color="#fff" />}
                  </span>
                </span>
              }
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--ink-mute)' }}>
        <span>
          {totalVotes} vote{totalVotes === 1 ? '' : 's'}
        </span>
        <span>•</span>
        <span>Closes {poll.closesAt}</span>
      </div>
    </div>
  );
}
