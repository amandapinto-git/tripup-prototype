import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import MemberChipRow from '../../components/MemberChipRow';
import { formatMoney } from '../../utils/balances';
import { YOU_ID } from '../../data/seed';

// The fake bill a "Scan a bill" tap pretends to read — a real integration
// would OCR an actual photo, but for this prototype the point is the
// assignment flow that follows, not OCR itself.
const SCANNED_BILL = {
  vendor: 'Cervejaria Ramiro',
  items: [
    { id: 'si-1', name: 'Grilled Prawns', price: 28 },
    { id: 'si-2', name: 'Percebes (Goose Barnacles)', price: 22 },
    { id: 'si-3', name: 'Bread & Olives', price: 6 },
    { id: 'si-4', name: 'House Wine, Bottle', price: 32 },
    { id: 'si-5', name: 'Sparkling Water x2', price: 6 },
  ],
};

// An itinerary item's own type already implies an expense category, so a
// linked expense never needs to ask for one separately.
const TYPE_TO_CATEGORY = { hotel: 'stay', food: 'food', flight: 'transport', activity: 'activities' };

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

  const [step, setStep] = useState(method === 'scan' ? 'scanning' : method === 'manual' ? 1 : 0);
  const [draft, setDraft] = useState({
    description: '',
    amount: '',
    category: 'food',
    itineraryItemId: null,
    paidBy: YOU_ID,
    splitType: 'equal',
    splitWith: trip ? trip.members.map((m) => m.id) : [],
    customSplit: {},
    scanItems: null,
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
    else if (step === 'scanning') setStep(0);
    else if (step === 'assign') setStep('scanning');
    else setStep((s) => s - 1);
  };

  const linkedItem = itineraryItems.find((i) => i.id === draft.itineraryItemId);

  const finish = () => {
    const isScan = Boolean(draft.scanItems);
    let amount = Number(draft.amount) || 0;
    let customSplit;
    let splitWith = draft.splitWith;

    if (isScan) {
      const sums = {};
      draft.scanItems.forEach((it) => {
        if (!it.assignedTo.length) return;
        const share = it.price / it.assignedTo.length;
        it.assignedTo.forEach((id) => {
          sums[id] = (sums[id] || 0) + share;
        });
      });
      amount = draft.scanItems.reduce((sum, it) => sum + it.price, 0);
      customSplit = sums;
      splitWith = Object.keys(sums);
    } else if (draft.splitType === 'custom') {
      customSplit = Object.fromEntries(draft.splitWith.map((id) => [id, Number(draft.customSplit[id]) || 0]));
    }

    dispatch({
      type: 'ADD_EXPENSE',
      tripId,
      expense: {
        id: `ex-${Date.now()}`,
        description: linkedItem?.title || draft.description || 'Untitled expense',
        amount,
        category: draft.category,
        paidBy: draft.paidBy,
        splitType: isScan ? 'custom' : draft.splitType,
        splitWith,
        customSplit,
        items: isScan ? draft.scanItems : undefined,
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
          <MethodStep onManual={() => setStep(1)} onScan={() => setStep('scanning')} />
        )}
        {step === 'scanning' && (
          <ScanningStep
            onDone={() => {
              setDraft((d) => ({
                ...d,
                description: SCANNED_BILL.vendor,
                category: 'food',
                scanItems: SCANNED_BILL.items.map((it) => ({ ...it, assignedTo: trip.members.map((m) => m.id) })),
              }));
              setStep('assign');
            }}
          />
        )}
        {step === 'assign' && (
          <ItemAssignStep trip={trip} draft={draft} setDraft={setDraft} onConfirm={finish} />
        )}
        {step === 1 && (
          <LinkStep
            items={itineraryItems}
            days={itineraryDays}
            selected={draft.itineraryItemId}
            onSelect={(id) => {
              const item = itineraryItems.find((i) => i.id === id);
              setDraft((d) => ({
                ...d,
                itineraryItemId: id,
                category: item ? TYPE_TO_CATEGORY[item.type] || d.category : d.category,
              }));
            }}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (draft.itineraryItemId !== null ? (
          <LinkedDetailsStep linkedItem={linkedItem} trip={trip} draft={draft} setDraft={setDraft} onConfirm={finish} />
        ) : (
          <DetailsStep draft={draft} setDraft={setDraft} onNext={() => setStep(3)} />
        ))}
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
      <div className="screen-pad" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 32 }}>
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

// Who actually fronted the money — separate from who owes a share of it.
// Defaults to "you" since that's who's filling out the form, but any
// itineraryItemId member can be picked instead (e.g. logging an expense
// someone else paid for).
function PaidByField({ trip, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FieldLabel>Paid by</FieldLabel>
      <MemberChipRow members={trip.members} selectedIds={[value]} onToggle={onChange} />
    </div>
  );
}

// Shared by the standalone SplitStep (no linked item) and LinkedDetailsStep
// (linked item — amount, category and split all collapse onto one page
// since the item itself already stands in for a description).
function SplitFields({ trip, draft, setDraft }) {
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

  return (
    <>
      <PaidByField trip={trip} value={draft.paidBy} onChange={(id) => setDraft((d) => ({ ...d, paidBy: id }))} />

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
    </>
  );
}

function canConfirmSplit(draft) {
  const isCustom = draft.splitType === 'custom';
  return draft.splitWith.length > 0 && (!isCustom || draft.splitWith.every((id) => Number(draft.customSplit[id]) > 0));
}

function SplitStep({ trip, draft, setDraft, onConfirm }) {
  return (
    <>
      <div className="screen-pad" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 32 }}>
        <SplitFields trip={trip} draft={draft} setDraft={setDraft} />
      </div>
      <div className="bottom-bar">
        <button className="btn btn-primary" disabled={!canConfirmSplit(draft)} onClick={onConfirm}>
          Confirm & Add
        </button>
      </div>
    </>
  );
}

// The item being linked already carries its own title, so a separate
// description would just repeat it — amount, category and split all
// collapse onto this one page instead of the two an unlinked expense uses.
function LinkedDetailsStep({ linkedItem, trip, draft, setDraft, onConfirm }) {
  const canConfirm = Number(draft.amount) > 0 && canConfirmSplit(draft);
  return (
    <>
      <div className="screen-pad" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 32 }}>
        <div>
          <FieldLabel>Linked item</FieldLabel>
          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 600 }}>{linkedItem?.title}</p>
        </div>
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
        <SplitFields trip={trip} draft={draft} setDraft={setDraft} />
      </div>
      <div className="bottom-bar">
        <button className="btn btn-primary" disabled={!canConfirm} onClick={onConfirm}>
          Confirm & Add
        </button>
      </div>
    </>
  );
}

// A believable "reading the receipt" pause before the fake OCR result
// lands — the fixed delay stands in for the real scan a proper OCR
// integration would run.
function ScanningStep({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="screen-pad" style={{ paddingTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      <div
        style={{
          position: 'relative',
          width: 220,
          padding: 20,
          background: '#fff',
          borderRadius: 12,
          border: '1px solid var(--border-soft)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 10, width: '55%', margin: '0 auto 6px', background: 'rgba(0,0,0,0.1)', borderRadius: 4 }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 8,
                width: i % 3 === 0 ? '85%' : '65%',
                background: 'rgba(0,0,0,0.07)',
                borderRadius: 4,
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ top: 0 }}
          animate={{ top: '100%' }}
          transition={{ duration: 1.6, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 3,
            background: '#000',
            boxShadow: '0 0 14px 2px rgba(0,0,0,0.4)',
          }}
        />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Scanning receipt…</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-mute)' }}>Pulling out items and prices</p>
      </div>
    </div>
  );
}

// Assigning each line item to whoever actually had it (rather than one
// flat split for the whole bill) is what makes "wine only for the two
// people who drank it, food for everyone" a single expense instead of two.
function ItemAssignStep({ trip, draft, setDraft, onConfirm }) {
  const items = useMemo(() => draft.scanItems || [], [draft.scanItems]);

  const toggleItemMember = (itemId, memberId) => {
    setDraft((d) => ({
      ...d,
      scanItems: d.scanItems.map((it) =>
        it.id === itemId
          ? {
              ...it,
              assignedTo: it.assignedTo.includes(memberId)
                ? it.assignedTo.filter((id) => id !== memberId)
                : [...it.assignedTo, memberId],
            }
          : it
      ),
    }));
  };

  const toggleAllForItem = (itemId) => {
    setDraft((d) => ({
      ...d,
      scanItems: d.scanItems.map((it) => {
        if (it.id !== itemId) return it;
        const allSelected = trip.members.every((m) => it.assignedTo.includes(m.id));
        return { ...it, assignedTo: allSelected ? [] : trip.members.map((m) => m.id) };
      }),
    }));
  };

  const totals = useMemo(() => {
    const sums = Object.fromEntries(trip.members.map((m) => [m.id, 0]));
    items.forEach((it) => {
      if (!it.assignedTo.length) return;
      const share = it.price / it.assignedTo.length;
      it.assignedTo.forEach((id) => {
        sums[id] += share;
      });
    });
    return sums;
  }, [items, trip.members]);

  const billTotal = items.reduce((sum, it) => sum + it.price, 0);
  const canConfirm = items.length > 0 && items.every((it) => it.assignedTo.length > 0);

  return (
    <>
      <div className="screen-pad" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 32 }}>
        <div>
          <FieldLabel>Scanned from</FieldLabel>
          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 600 }}>{draft.description}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FieldLabel>Who had this?</FieldLabel>
          {items.map((it) => (
            <div key={it.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="row-between">
                <span style={{ fontSize: 14, fontWeight: 600 }}>{it.name}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{formatMoney(it.price)}</span>
              </div>
              <MemberChipRow
                members={trip.members}
                selectedIds={it.assignedTo}
                onToggle={(id) => toggleItemMember(it.id, id)}
                onToggleAll={() => toggleAllForItem(it.id)}
              />
            </div>
          ))}
        </div>

        <PaidByField trip={trip} value={draft.paidBy} onChange={(id) => setDraft((d) => ({ ...d, paidBy: id }))} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FieldLabel>Split summary</FieldLabel>
          {trip.members.filter((m) => totals[m.id] > 0).map((m) => (
            <div key={m.id} className="row-between">
              <span style={{ fontSize: 14 }}>{m.id === YOU_ID ? 'You' : m.name}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{formatMoney(totals[m.id])}</span>
            </div>
          ))}
          <div className="row-between" style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 10, marginTop: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{formatMoney(billTotal)}</span>
          </div>
        </div>
      </div>
      <div className="bottom-bar">
        <button className="btn btn-primary" disabled={!canConfirm} onClick={onConfirm}>
          Confirm & Add
        </button>
      </div>
    </>
  );
}
