import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CaretLeft, Plus, UserSwitch, PencilSimpleLine, X, Clock } from '@phosphor-icons/react';
import { useTrip, useTripDispatch } from '../../state/TripContext';
import CategoryPicker from '../../components/CategoryPicker';
import FieldLabel from '../../components/FieldLabel';
import UnderlineField, { underlineInputStyle } from '../../components/UnderlineField';
import LocationField from '../../components/LocationField';
import PillToggle from '../../components/PillToggle';

function formatTime(value) {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// Stays in UTC, like every other date-string formatter in this app, so the
// viewer's own timezone can never shift the displayed day.
function formatDayLabel(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const CLOSES_OPTIONS = [
  { value: 'everyone', label: "When everyone's input is in" },
  { value: 'before_time', label: '1 hour before scheduled time' },
];

const CATEGORY_TO_TYPE = { food: 'food', stay: 'hotel', transport: 'flight', activities: 'activity' };

export default function AddPlanFlow() {
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const navigate = useNavigate();
  const dispatch = useTripDispatch();
  const [params] = useSearchParams();
  // The date the user tapped into this flow from is just the default — the
  // date field below lets them change it before submitting.
  const [date, setDate] = useState(params.get('date') || trip?.start || '');
  const label = formatDayLabel(date);

  const [mode, setMode] = useState(null); // 'known' | 'vote'
  const [item, setItem] = useState({ title: '', location: '', time: '', category: 'activities' });
  const [poll, setPoll] = useState({
    question: '',
    category: 'activities',
    options: ['', '', ''],
    timeMode: 'manual',
    timeManual: '',
    timeOptions: ['', ''],
    closesRule: 'everyone',
  });

  if (!trip) return null;

  const goBack = () => {
    if (mode === null) navigate(`/trip/${tripId}?tab=itinerary`);
    else setMode(null);
  };

  const submitKnown = () => {
    if (!item.title.trim()) return;
    dispatch({
      type: 'ADD_ITINERARY_ITEM',
      tripId,
      date,
      dayLabel: label,
      item: {
        id: `it-${Date.now()}`,
        type: CATEGORY_TO_TYPE[item.category],
        title: item.title,
        location: item.location.trim() || undefined,
        time: formatTime(item.time) || 'Time TBD',
      },
    });
    navigate(`/trip/${tripId}?tab=itinerary`);
  };

  const submitPoll = () => {
    const options = poll.options.filter((o) => o.trim());
    if (!poll.question.trim() || options.length < 2) return;

    const closesLabel = CLOSES_OPTIONS.find((c) => c.value === poll.closesRule)?.label;
    const scheduledTime = poll.timeMode === 'manual' ? formatTime(poll.timeManual) : null;
    const timeOptions = poll.timeMode === 'vote' ? poll.timeOptions.filter((t) => t.trim()) : [];

    dispatch({
      type: 'ADD_ITINERARY_ITEM',
      tripId,
      date,
      dayLabel: label,
      item: {
        id: `poll-${Date.now()}`,
        type: 'poll',
        category: CATEGORY_TO_TYPE[poll.category],
        title: poll.question,
        time: scheduledTime || (timeOptions.length ? 'Time: vote in progress' : 'Time TBD'),
        timeOptions: timeOptions.map((t) => formatTime(t)),
        closesAt: closesLabel,
        decided: false,
        options: options.map((text, i) => ({ id: `opt-${Date.now()}-${i}`, text, votes: [] })),
      },
    });
    navigate(`/trip/${tripId}?tab=itinerary`);
  };

  return (
    <div className="phone-scroll" style={{ background: '#fff' }}>
      <div className="top-bar">
        <button className="icon-btn" onClick={goBack}>
          <CaretLeft size={16} weight="bold" />
        </button>
        <h1>{trip.name}</h1>
        <span style={{ width: 38 }} />
      </div>

      <div className="fade-route" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {mode === null && (
          <DecideStep onKnown={() => setMode('known')} onVote={() => setMode('vote')} />
        )}
        {mode === 'known' && (
          <KnownForm
            item={item}
            setItem={setItem}
            onSubmit={submitKnown}
            date={date}
            setDate={setDate}
            trip={trip}
          />
        )}
        {mode === 'vote' && (
          <PollForm
            poll={poll}
            setPoll={setPoll}
            onSubmit={submitPoll}
            dateLabel={label}
            date={date}
            setDate={setDate}
            trip={trip}
          />
        )}
      </div>
    </div>
  );
}

function DecideStep({ onKnown, onVote }) {
  return (
    <div className="screen-pad" style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 600 }}>Is the plan already decided?</p>
      <button className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }} onClick={onKnown}>
        <Plus size={24} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>I know what we're doing</span>
        <span style={{ fontSize: 14, color: 'var(--ink-mute)', textAlign: 'center' }}>Add it straight to the plan</span>
      </button>
      <button className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }} onClick={onVote}>
        <UserSwitch size={24} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Let's decide together</span>
        <span style={{ fontSize: 14, color: 'var(--ink-mute)', textAlign: 'center' }}>Start a vote with options</span>
      </button>
    </div>
  );
}

function KnownForm({ item, setItem, onSubmit, date, setDate, trip }) {
  return (
    <>
      <div className="screen-pad" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 32 }}>
        <UnderlineField label="What's the plan?">
          <input
            placeholder="eg. Dinner at Cervejaria Ramiro"
            value={item.title}
            onChange={(e) => setItem((d) => ({ ...d, title: e.target.value }))}
            className="poll-underline-input"
            style={underlineInputStyle()}
          />
        </UnderlineField>
        <LocationField value={item.location} onChange={(v) => setItem((d) => ({ ...d, location: v }))} />
        <DateField value={date} onChange={setDate} min={trip.start} max={trip.end} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldLabel>Time</FieldLabel>
          <TimePickerField value={item.time} onChange={(v) => setItem((d) => ({ ...d, time: v }))} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldLabel>Category</FieldLabel>
          <CategoryPicker selected={item.category} onChange={(key) => setItem((d) => ({ ...d, category: key }))} />
        </div>
      </div>
      <div className="bottom-bar">
        <button className="btn btn-primary" disabled={!item.title.trim()} onClick={onSubmit}>
          Confirm & Add
        </button>
      </div>
    </>
  );
}

function PollForm({ poll, setPoll, onSubmit, date, setDate, trip }) {
  const setOption = (i, value) =>
    setPoll((d) => ({ ...d, options: d.options.map((o, idx) => (idx === i ? value : o)) }));
  const addOption = () => setPoll((d) => ({ ...d, options: [...d.options, ''] }));

  const setTimeOption = (i, value) =>
    setPoll((d) => ({ ...d, timeOptions: d.timeOptions.map((o, idx) => (idx === i ? value : o)) }));
  const addTimeOption = () => setPoll((d) => ({ ...d, timeOptions: [...d.timeOptions, ''] }));
  const removeTimeOption = (i) =>
    setPoll((d) => ({ ...d, timeOptions: d.timeOptions.filter((_, idx) => idx !== i) }));

  // If the time itself is still being voted on, the poll can't possibly
  // close "1 hour before" a time nobody has agreed on yet — force the only
  // rule that makes sense, and grey out the other one instead of just
  // hiding it so it's clear *why* it's unavailable.
  const setTimeMode = (mode) =>
    setPoll((d) => ({ ...d, timeMode: mode, closesRule: mode === 'vote' ? 'everyone' : d.closesRule }));

  const canSubmit = poll.question.trim() && poll.options.filter((o) => o.trim()).length >= 2;

  return (
    <>
      <div className="screen-pad" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 32 }}>
        <UnderlineField label="What is being decided?">
          <input
            placeholder="eg. Friday's dinner restaurant"
            value={poll.question}
            onChange={(e) => setPoll((d) => ({ ...d, question: e.target.value }))}
            className="poll-underline-input"
            style={underlineInputStyle()}
          />
        </UnderlineField>

        <DateField value={date} onChange={setDate} min={trip.start} max={trip.end} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldLabel>Category</FieldLabel>
          <CategoryPicker selected={poll.category} onChange={(key) => setPoll((d) => ({ ...d, category: key }))} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldLabel>Options</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {poll.options.map((opt, i) => (
              <input
                key={i}
                className="input-box"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
              />
            ))}
            <button className="input-box" style={{ color: '#acacac', justifyContent: 'flex-start' }} onClick={addOption}>
              <Plus size={14} color="#acacac" /> Add an option
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FieldLabel>Time</FieldLabel>
          <PillToggle
            value={poll.timeMode}
            onChange={setTimeMode}
            options={[
              { value: 'vote', label: 'Vote on it' },
              { value: 'manual', label: 'Set manually' },
            ]}
          />

          {poll.timeMode === 'manual' ? (
            <TimePickerField value={poll.timeManual} onChange={(v) => setPoll((d) => ({ ...d, timeManual: v }))} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {poll.timeOptions.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <TimePickerField
                    value={t}
                    onChange={(v) => setTimeOption(i, v)}
                    placeholder={`Time option ${i + 1}`}
                  />
                  {poll.timeOptions.length > 2 && (
                    <button className="icon-btn" style={{ width: 48, height: 48, flexShrink: 0 }} onClick={() => removeTimeOption(i)}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button className="input-box" style={{ color: '#acacac', justifyContent: 'flex-start' }} onClick={addTimeOption}>
                <Plus size={14} color="#acacac" /> Add a time option
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FieldLabel>Close Poll</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CLOSES_OPTIONS.map((opt) => {
              const disabled = opt.value === 'before_time' && poll.timeMode === 'vote';
              const active = poll.closesRule === opt.value && !disabled;
              return (
                <button
                  key={opt.value}
                  disabled={disabled}
                  onClick={() => setPoll((d) => ({ ...d, closesRule: opt.value }))}
                  style={{
                    width: '100%',
                    borderRadius: 999,
                    padding: '13px 0',
                    fontSize: 14,
                    border: active ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    background: active ? '#000' : '#fff',
                    color: '#000',
                    fontWeight: active ? 700 : 400,
                    opacity: disabled ? 0.35 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span style={{ color: active ? '#fff' : '#000' }}>
                    {opt.label}
                    {disabled && ' (time not set yet)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bottom-bar">
        <button className="btn btn-primary" disabled={!canSubmit} onClick={onSubmit}>
          <PencilSimpleLine size={14} weight="bold" /> Confirm & Add
        </button>
      </div>
    </>
  );
}

function DateField({ value, onChange, min, max }) {
  return (
    <UnderlineField label="Date">
      <div style={{ position: 'relative' }}>
        <p style={underlineInputStyle({ margin: 0 })}>{formatDayLabel(value) || 'Select a date'}</p>
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const next = e.target.value;
            if (!next) return;
            onChange(next < min ? min : next > max ? max : next);
          }}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
      </div>
    </UnderlineField>
  );
}

function TimePickerField({ value, onChange, placeholder = 'Select a time' }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div className="input-box" style={{ color: value ? 'var(--ink)' : 'var(--ink-mute)', fontWeight: value ? 600 : 500 }}>
        <Clock size={16} weight={value ? 'fill' : 'regular'} style={{ flexShrink: 0 }} />
        <span>{value ? formatTime(value) : placeholder}</span>
      </div>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
      />
    </div>
  );
}
