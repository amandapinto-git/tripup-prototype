import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Bed, ForkKnife, Ticket, AirplaneTakeoff, Plus, Car, PersonSimpleWalk, NavigationArrow } from '@phosphor-icons/react';
import PollCard from '../../components/PollCard';
import MapsDrawer from '../../components/MapsDrawer';
import AirlineLogo from '../../components/AirlineLogo';
import AddPlanDecideDrawer from '../../components/AddPlanDecideDrawer';
import ItemDetailDrawer from '../../components/ItemDetailDrawer';
import { estimateTransit } from '../../utils/transit';
import { useTripDispatch } from '../../state/TripContext';

const ICONS = {
  hotel: Bed,
  food: ForkKnife,
  flight: AirplaneTakeoff,
  activity: Ticket,
};

// A flight has no `location`/`title` place name of its own — it's the
// airport at whichever end of the leg is relevant to the direction being
// asked about (the arrival city if it's the stop you just came from, the
// departure city if it's the stop you're heading to next).
function locationLabel(item, role) {
  if (!item) return null;
  if (item.type === 'flight') {
    return role === 'origin' ? `${item.outbound.to.city} Airport` : `${item.outbound.from.city} Airport`;
  }
  return item.location || item.title;
}

// Trip dates are plain calendar dates ("2026-05-12"), not instants — every
// step here stays in UTC so the viewer's own timezone can never shift a day
// forward or back (that off-by-one is exactly what broke the active chip).
function dateRange(start, end) {
  const days = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    const date = cursor.toISOString().slice(0, 10);
    const label = cursor.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
    days.push({ date, label });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export default function ItineraryBody({ trip }) {
  const navigate = useNavigate();
  const dispatch = useTripDispatch();
  const [params] = useSearchParams();
  const allDays = dateRange(trip.start, trip.end);
  const requestedDay = params.get('day');
  const requestedItem = params.get('item');
  // No explicit ?day= (e.g. arriving fresh from the tab bar, not a deep
  // link) lands on today — trip.currentDate — rather than always the
  // trip's first day, so opening the itinerary mid-trip doesn't require
  // scrolling the day carousel back to where things actually stand.
  const [activeDay, setActiveDay] = useState(
    requestedDay || trip.currentDate || trip.itinerary[0]?.date || allDays[0]?.date
  );
  const [mapsPlace, setMapsPlace] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [decideOpen, setDecideOpen] = useState(false);
  const itemRefs = useRef({});
  const dayTabRefs = useRef({});

  // Defaulting to today (above) means the active tab is often not the
  // first/visible one — scroll the day carousel so it's actually in view
  // instead of silently selected off-screen.
  useEffect(() => {
    dayTabRefs.current[activeDay]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeDay]);

  // A notification banner can deep-link here while ItineraryBody is already
  // mounted (same route, just new day/item params) — react-router doesn't
  // remount in that case, so the active day needs to follow `requestedDay`
  // whenever it changes, not just once at mount. Adjusting state during
  // render (React's documented pattern for this) rather than in an effect,
  // since the actual DOM item this feeds into (below) needs the change to
  // have already landed by the time it runs.
  const [prevRequestedDay, setPrevRequestedDay] = useState(requestedDay);
  if (requestedDay !== prevRequestedDay) {
    setPrevRequestedDay(requestedDay);
    if (requestedDay) setActiveDay(requestedDay);
  }

  useEffect(() => {
    if (!requestedItem) return;
    // Depends on activeDay (not requestedDay) so this only fires once the
    // day switch above has actually committed and the target item's ref is
    // populated in the DOM — not on the render where the day is still old.
    itemRefs.current[requestedItem]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [requestedItem, activeDay]);

  const day = trip.itinerary.find((d) => d.date === activeDay) || {
    ...(allDays.find((d) => d.date === activeDay) || { date: activeDay, label: '' }),
    items: [],
  };

  // A day is "past" (everything done, lines solid black), "current" (the
  // trip.currentDate day — items before the highlighted one are done, the
  // highlighted one is happening now, later ones haven't happened), or
  // "future" (nothing has happened yet, everything reads as upcoming).
  const dayState = !trip.currentDate
    ? 'current'
    : day.date < trip.currentDate
      ? 'past'
      : day.date > trip.currentDate
        ? 'future'
        : 'current';

  const highlightIndex =
    dayState === 'past'
      ? day.items.length
      : dayState === 'future'
        ? -1
        : day.highlightId
          ? day.items.findIndex((i) => i.id === day.highlightId)
          : -1;

  return (
    <>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '36px 24px 28px' }}>
        {allDays.map((d) => {
          const [weekday, rest] = d.label.split(', ');
          const active = d.date === day?.date;
          return (
            <button
              key={d.date}
              ref={(el) => {
                dayTabRefs.current[d.date] = el;
              }}
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
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 400,
                  color: active ? 'rgba(255,255,255,0.75)' : 'var(--ink-soft)',
                  whiteSpace: 'nowrap',
                }}
              >
                {rest}
              </p>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '0 24px', paddingBottom: 120 }}>
        {day.items.length === 0 && (
          <p style={{ color: 'var(--ink-mute)', fontSize: 14, paddingTop: 16 }}>Nothing planned yet.</p>
        )}
        {day && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {day.items.map((item, i) => {
              const isLast = i === day.items.length - 1;
              // Nothing reads as "done" or "not yet" anymore — every stop
              // stays fully legible. "Now" is still called out, just via the
              // current item's own photo treatment, not by dimming everyone
              // else.
              const muted = false;
              const isCurrent = i === highlightIndex;
              const lineStyle = '#000';
              const transitLineStyle = '#000';

              const nextItem = day.items[i + 1];
              // A poll's real location isn't known until it's decided — no
              // meaningful distance/time can be estimated to or from one.
              const showTransit = !isLast && item.type !== 'poll' && nextItem.type !== 'poll';
              const origin = showTransit ? locationLabel(item, 'origin') : null;
              const destination = showTransit ? locationLabel(nextItem, 'destination') : null;

              if (item.type === 'poll') {
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[item.id] = el;
                    }}
                  >
                    <TimelineRow isLast={isLast} icon={ICONS[item.category] || Ticket} lineStyle={lineStyle}>
                      <PollCard
                        tripId={trip.id}
                        poll={item}
                        members={trip.members}
                        onOpenDetail={setDetailItem}
                        onConfirmed={() => {
                          // The card's height changes once it collapses into
                          // its decided state — re-center on it next frame
                          // so it doesn't end up drifting out of view.
                          requestAnimationFrame(() => {
                            itemRefs.current[item.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          });
                        }}
                      />
                    </TimelineRow>
                  </div>
                );
              }

              const Icon = ICONS[item.type] || Ticket;
              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                >
                  <TimelineRow isLast={isLast} icon={Icon} current={isCurrent} muted={muted} lineStyle={lineStyle}>
                    {item.type === 'flight' ? (
                      <FlightCard
                        item={item}
                        muted={muted}
                        onOpenMaps={() => setMapsPlace(`${item.outbound.to.city} Airport`)}
                      />
                    ) : (
                      <ItemCard item={item} current={isCurrent} muted={muted} onOpenMaps={() => setDetailItem(item)} />
                    )}
                  </TimelineRow>
                  {showTransit && (
                    <TransitRow
                      key={`${origin}|${destination}`}
                      lineStyle={transitLineStyle}
                      origin={origin}
                      destination={destination}
                      onNavigate={() => setMapsPlace({ origin, destination })}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button className="fab-btn" onClick={() => setDecideOpen(true)}>
        <Plus size={16} weight="bold" /> Add an event
      </button>

      <MapsDrawer place={mapsPlace} onClose={() => setMapsPlace(null)} />
      <ItemDetailDrawer
        key={detailItem?.id}
        item={detailItem}
        expense={detailItem && trip.expenses.find((e) => e.itineraryItemId === detailItem.id)}
        members={trip.members}
        onClose={() => setDetailItem(null)}
        onGetDirections={() => {
          setMapsPlace(detailItem.location || detailItem.title);
          setDetailItem(null);
        }}
        onCancelItem={() => {
          dispatch({ type: 'REMOVE_ITINERARY_ITEM', tripId: trip.id, itemId: detailItem.id });
          setDetailItem(null);
        }}
        onViewExpense={() => {
          setDetailItem(null);
          navigate(`/trip/${trip.id}?tab=expenses`);
        }}
      />
      {decideOpen && (
        <AddPlanDecideDrawer
          onClose={() => setDecideOpen(false)}
          onChoose={(mode) =>
            navigate(
              `/trip/${trip.id}/add-plan?date=${day?.date || trip.start}&label=${encodeURIComponent(day?.label || '')}&mode=${mode}`
            )
          }
        />
      )}
    </>
  );
}

function TimelineRow({ icon: Icon, isLast, current, muted, lineStyle, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon
            size={current ? 18 : 16}
            color={current ? '#000' : muted ? 'rgba(0,0,0,0.32)' : '#000'}
            weight={current ? 'fill' : 'regular'}
          />
        </div>
        {!isLast && <div style={{ flex: 1, width: 1, background: lineStyle || 'var(--border-soft)' }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 20, width: '100%', minWidth: 0 }}>{children}</div>
    </div>
  );
}

// Travel leg between two stops — sits inline in the timeline so the
// connecting line reads as a continuous route, not a broken one. Mode and
// time come from a real estimate (geocoded distance, walking vs an actual
// driving route) rather than a mock, so they track the real places involved.
function TransitRow({ lineStyle, origin, destination, onNavigate }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!origin || !destination) return undefined;
    estimateTransit(origin, destination).then((result) => {
      if (!cancelled) setInfo(result);
    });
    return () => {
      cancelled = true;
    };
  }, [origin, destination]);

  const Icon = info?.mode === 'car' ? Car : PersonSimpleWalk;
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
        <div style={{ flex: 1, width: 1, background: lineStyle || 'var(--border-soft)' }} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 20,
          width: '100%',
          minWidth: 0,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 999,
            padding: '8px 14px',
          }}
        >
          <Icon size={14} weight="fill" />
          {info ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>{info.duration}</span>
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.35)' }}>•</span>
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>{info.distance}</span>
            </>
          ) : (
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.35)' }}>···</span>
          )}
        </span>
        <button
          onClick={onNavigate}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <NavigationArrow size={15} color="#fff" weight="fill" style={{ transform: 'rotate(90deg)' }} />
        </button>
      </div>
    </div>
  );
}

function ItemCard({ item, current, muted, onOpenMaps }) {
  if (current) {
    return (
      <button
        onClick={onOpenMaps}
        style={{
          width: '100%',
          textAlign: 'left',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 148,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '16px 18px',
          color: '#fff',
          backgroundImage: `linear-gradient(rgba(10,14,18,0.78), rgba(10,14,18,0.78)), url(${item.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ position: 'relative', width: 8, height: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="timeline-pulse timeline-pulse--white" aria-hidden />
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
          </span>
          {item.time}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 600 }}>{item.title}</p>
        {item.location && (
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{item.location}</p>
        )}
        {item.description && (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </p>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onOpenMaps}
      className="card"
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px 18px',
        borderRadius: 'var(--radius-card)',
        opacity: muted ? 0.4 : 1,
      }}
    >
      <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-mute)' }}>{item.time}</p>
      <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 600 }}>{item.title}</p>
      {item.location && (
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-mute)' }}>{item.location}</p>
      )}
    </button>
  );
}

function FlightCard({ item, muted, onOpenMaps }) {
  return (
    <button
      onClick={onOpenMaps}
      className="card"
      style={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        borderRadius: 'var(--radius-card)',
        padding: 18,
        opacity: muted ? 0.4 : 1,
      }}
    >
      <div>
        <div style={{ marginBottom: 8 }}>
          <AirlineLogo airline={item.airline} variant="black" height={16} />
        </div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink-mute)' }}>Flight Code: {item.outbound.code}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-mute)' }}>{item.outbound.from.time}</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{item.outbound.from.code}</p>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-mute)' }}>{item.outbound.from.city}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, padding: '0 10px' }}>
          <span style={{ flex: 1, height: 0, borderTop: '1.5px dotted var(--border-soft)' }} />
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#000',
              color: '#fff',
              borderRadius: 999,
              padding: '4px 10px',
              flexShrink: 0,
            }}
          >
            <AirplaneTakeoff size={12} weight="fill" />
            <span style={{ fontSize: 14, whiteSpace: 'nowrap' }}>{item.outbound.code}</span>
          </span>
          <span style={{ flex: 1, height: 0, borderTop: '1.5px dotted var(--border-soft)' }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-mute)' }}>{item.outbound.to.time}</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{item.outbound.to.code}</p>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-mute)' }}>{item.outbound.to.city}</p>
        </div>
      </div>
    </button>
  );
}
