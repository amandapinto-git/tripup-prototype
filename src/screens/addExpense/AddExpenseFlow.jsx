import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  CaretLeft,
  Camera,
  PencilSimple,
  Check,
} from '@phosphor-icons/react';
import { useTrip, useTripDispatch } from '../../state/TripContext';
import Avatar from '../../components/Avatar';
import CategoryPicker from '../../components/CategoryPicker';
import FieldLabel from '../../components/FieldLabel';
import UnderlineField, { underlineInputStyle } from '../../components/UnderlineField';
import PillToggle from '../../components/PillToggle';
import { YOU_ID } from '../../data/seed';

export default function AddExpenseFlow() {
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const navigate = useNavigate();
  const dispatch = useTripDispatch();
  const [params] = useSearchParams();
  // Usually arrives already decided — AddExpenseMethodDrawer asks "scan vs
  // manual" up front and passes the answer via ?method=. Falling back to
  // the in-flow MethodStep below only matters for a direct/bookmarked URL.
  const method = params.get('method');

  const [step, setStep] = useState(method === 'scan' ? 2 : method === 'manual' ? 1 : 0);
  const [draft, setDraft] = useState({
    description: method === 'scan' ? 'Oysho Restaurant Tokyo' : '',
    amount: method === 'scan' ? '86' : '',
    category: 'food',
    itineraryItemId: null,
    splitType: 'equal',
    splitWith: trip ? trip.members.map((m) => m.id) : [],
    customSplit: {},
  });

  const itineraryItems = useMemo(
    () =>
      trip?.itinerary.flatMap((d) => d.items.filter((i) => i.type !== 'poll').map((i) => ({ ...i, day: d.label, date: d.date }))) ||
      [],
    [trip]
  );
  const itineraryDays = useMemo(
    () => trip?.itinerary.filter((d) => d.items.some((i) => i.type !== 'poll')).map((d) => ({ date: d.date, label: d.label })) || [],
    [trip]
  );

  if (!trip) return null;

  const goBack = () => {
    if (step === 0) navigate(`/trip/${tripId}?tab=expenses`);
    else setStep((s) => s - 1);
  };

  const finish = () => {
    dispatch({
      type: 'ADD_EXPENSE',
      tripId,
      expense: {
        id: `ex-${Date.now()}`,
        description: draft.description || 'Untitled expense',
        amount: Number(draft.amount) || 0,
        category: draft.category,
        paidBy: YOU_ID,
        splitType: draft.splitType,
        splitWith: draft.splitWith,
        customSplit:
          draft.splitType === 'custom'
            ? Object.fromEntries(draft.splitWith.map((id) => [id, Number(draft.customSplit[id]) || 0]))
            : undefined,
        date: new Date().toISOString(),
        itineraryItemId: draft.itineraryItemId,
      },
    });
    navigate(`/trip/${tripId}?tab=expenses`, { state: { toast: 'Expense added' } });
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
        {step === 0 && (
          <MethodStep
            onManual={() => setStep(1)}
            onScan={() => {
              setDraft((d) => ({ ...d, description: 'Oysho Restaurant Tokyo', amount: '86', category: 'food' }));
              setStep(2);
            }}
          />
        )}
        {step === 1 && (
          <LinkStep
            items={itineraryItems}
            days={itineraryDays}
            selected={draft.itineraryItemId}
            onSelect={(id) => setDraft((d) => ({ ...d, itineraryItemId: id }))}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <DetailsStep
            draft={draft}
            setDraft={setDraft}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <SplitStep trip={trip} draft={draft} setDraft={setDraft} onConfirm={finish} />
        )}
      </div>
    </div>
  );
}

function MethodStep({ onManual, onScan }) {
  return (
    <div className="screen-pad" style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>Select a way to add an expense</p>
      <button className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }} onClick={onScan}>
        <Camera size={26} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Scan a bill</span>
        <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Auto-fill amount and items</span>
      </button>
      <button className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }} onClick={onManual}>
        <PencilSimple size={26} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Enter manually</span>
        <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Title, amount and category</span>
      </button>
    </div>
  );
}

function LinkStep({ items, days, selected, onSelect, onNext }) {
  const [activeDay, setActiveDay] = useState(null); // null = All

  const visibleItems = activeDay ? items.filter((i) => i.date === activeDay) : items;

  return (
    <>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '32px 24px 16px' }}>
        <button
          onClick={() => setActiveDay(null)}
          style={{
            flex: '1 0 0',
            minWidth: 64,
            padding: '14px 18px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: activeDay === null ? '#000' : '#fff',
            border: `1px solid ${activeDay === null ? '#000' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: activeDay === null ? '#fff' : 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
            All
          </p>
        </button>
        {days.map((d) => {
          const [weekday, rest] = d.label.split(', ');
          const active = d.date === activeDay;
          return (
            <button
              key={d.date}
              onClick={() => setActiveDay(d.date)}
              style={{
                flex: '1 0 0',
                minWidth: 76,
                padding: '14px 22px',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: active ? '#000' : '#fff',
                border: `1px solid ${active ? '#000' : 'rgba(0,0,0,0.1)'}`,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: active ? '#fff' : 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                {weekday}
              </p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: active ? 'rgba(255,255,255,0.75)' : 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                {rest}
              </p>
            </button>
          );
        })}
      </div>
      <div className="screen-pad" style={{ paddingTop: 8, paddingBottom: 32 }}>
        <p style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600 }}>Link an itinerary item to this expense</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeDay === null && (
            <button
              className="list-row"
              style={{ width: '100%', textAlign: 'left', background: selected === null ? 'var(--surface-card)' : 'transparent' }}
              onClick={() => onSelect(null)}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-mute)' }}>Don't link an item</span>
              {selected === null && <Check size={16} weight="bold" />}
            </button>
          )}
          {visibleItems.map((item) => (
            <button
              key={item.id}
              className="list-row"
              style={{ width: '100%', textAlign: 'left', background: selected === item.id ? 'var(--surface-card)' : 'transparent' }}
              onClick={() => onSelect(item.id)}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.title}</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--ink-mute)' }}>{item.day}</p>
              </div>
              {selected === item.id && <Check size={16} weight="bold" />}
            </button>
          ))}
          {activeDay !== null && visibleItems.length === 0 && (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-mute)' }}>Nothing planned this day.</p>
          )}
        </div>
      </div>
      <div className="bottom-bar">
        <button className="btn btn-primary" onClick={onNext}>
          Next
        </button>
      </div>
    </>
  );
}

function DetailsStep({ draft, setDraft, onNext }) {
  const canContinue = draft.description.trim() && Number(draft.amount) > 0;
  return (
    <>
      <div className="screen-pad" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 32 }}>
        <UnderlineField label="Description">
          <input
            placeholder="eg. Cervejaria Ramiro"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            className="poll-underline-input"
            style={underlineInputStyle()}
          />
        </UnderlineField>
        <UnderlineField label="Amount">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink-mute)' }}>$</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={draft.amount}
              onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
              className="poll-underline-input"
              style={underlineInputStyle()}
            />
          </div>
        </UnderlineField>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldLabel>Category</FieldLabel>
          <CategoryPicker selected={draft.category} onChange={(key) => setDraft((d) => ({ ...d, category: key }))} />
        </div>
      </div>
      <div className="bottom-bar">
        <button className="btn btn-primary" disabled={!canContinue} onClick={onNext}>
          Next
        </button>
      </div>
    </>
  );
}

function SplitStep({ trip, draft, setDraft, onConfirm }) {
  const isCustom = draft.splitType === 'custom';
  const perPerson = draft.splitWith.length ? Number(draft.amount) / draft.splitWith.length : 0;
  const assigned = draft.splitWith.reduce((sum, id) => sum + (Number(draft.customSplit[id]) || 0), 0);

  const toggleMember = (id) => {
    setDraft((d) => ({
      ...d,
      splitWith: d.splitWith.includes(id) ? d.splitWith.filter((m) => m !== id) : [...d.splitWith, id],
    }));
  };

  const setCustomAmount = (id, value) => {
    setDraft((d) => ({ ...d, customSplit: { ...d.customSplit, [id]: value } }));
  };

  const canConfirm =
    draft.splitWith.length > 0 && (!isCustom || draft.splitWith.every((id) => Number(draft.customSplit[id]) > 0));

  return (
    <>
      <div className="screen-pad" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldLabel>Split Options</FieldLabel>
          <PillToggle
            value={draft.splitType}
            onChange={(splitType) => setDraft((d) => ({ ...d, splitType }))}
            options={[
              { value: 'equal', label: 'Equally' },
              { value: 'custom', label: 'Custom' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {trip.members.map((m) => {
            const included = draft.splitWith.includes(m.id);
            return (
              <div key={m.id} className="list-row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Avatar member={m} size={32} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{m.id === 'you' ? 'You' : m.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {included && isCustom ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-mute)' }}>$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={draft.customSplit[m.id] ?? ''}
                        onChange={(e) => setCustomAmount(m.id, e.target.value)}
                        style={{
                          width: 56,
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--ink)',
                          textAlign: 'right',
                        }}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {included ? `$${perPerson.toFixed(0)}` : '—'}
                    </span>
                  )}
                  <button
                    onClick={() => toggleMember(m.id)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: `1.5px solid ${included ? 'var(--accent)' : 'var(--border)'}`,
                      background: included ? 'var(--accent)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {included && <Check size={13} weight="bold" color="#fff" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {isCustom && (
          <p style={{ margin: 0, fontSize: 13, color: assigned === Number(draft.amount) ? 'var(--ink-mute)' : 'var(--danger)' }}>
            Assigned ${assigned.toFixed(0)} of ${(Number(draft.amount) || 0).toFixed(0)}
          </p>
        )}
      </div>
      <div className="bottom-bar">
        <button className="btn btn-primary" disabled={!canConfirm} onClick={onConfirm}>
          Confirm & Add
        </button>
      </div>
    </>
  );
}
