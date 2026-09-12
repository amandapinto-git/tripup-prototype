import { useNavigate } from 'react-router-dom';
import { Bell, User, CaretRight, CheckCircle } from '@phosphor-icons/react';
import { useTripState } from '../state/TripContext';
import { AvatarStack } from '../components/Avatar';
import StatusBar from '../components/StatusBar';
import { YOU_ID } from '../data/seed';
import { isPollClosed, pollWinner } from '../utils/polls';

const TRENDING = [
  {
    name: 'Lisbon Long Weekend',
    image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Alpine Ski Week',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Bali Group Retreat',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop',
  },
];

function findOpenPolls(trip) {
  const polls = [];
  for (const day of trip.itinerary) {
    for (const item of day.items) {
      if (item.type === 'poll' && !item.decided) {
        const youVoted = item.options.some((o) => o.votes.includes(YOU_ID));
        if (!youVoted) polls.push({ trip, day, item });
      }
    }
  }
  return polls;
}

// Closed, unconfirmed, and created by the current user — these are the
// polls only they can act on, so they get their own notification-style
// section rather than being folded into "Need Your Input".
function findPendingConfirmations(trip) {
  const polls = [];
  for (const day of trip.itinerary) {
    for (const item of day.items) {
      if (item.type === 'poll' && !item.decided && item.createdBy === YOU_ID && isPollClosed(item, trip.members)) {
        polls.push({ trip, day, item });
      }
    }
  }
  return polls;
}

export default function HomeScreen() {
  const { trips } = useTripState();
  const navigate = useNavigate();

  const upcoming = trips.filter((t) => t.status === 'upcoming');
  const past = trips.filter((t) => t.status === 'past');
  const activeTrip = trips.find((t) => t.status === 'current');
  const allActive = [...(activeTrip ? [activeTrip] : []), ...upcoming];
  const needsInput = allActive.flatMap(findOpenPolls);
  const pendingConfirmations = allActive.flatMap(findPendingConfirmations);

  return (
    <div className="phone-scroll" style={{ background: '#fff' }}>
      <StatusBar />
      <div className="top-bar" style={{ paddingTop: 'max(8px, calc(env(safe-area-inset-top, 0px) + 10px))' }}>
        <h1 className="text-h2" style={{ color: '#000', flex: 'none', textAlign: 'left' }}>TripUp</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="icon-btn">
            <Bell size={16} weight="bold" />
          </button>
          <button className="icon-btn">
            <User size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 44, paddingBottom: 32 }}>
        {activeTrip && <JumpBackInCard trip={activeTrip} onClick={() => navigate(`/trip/${activeTrip.id}`)} />}

        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 className="section-title">Upcoming Trips</h2>
          {upcoming.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {upcoming.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => navigate(`/trip/${trip.id}`)} />
              ))}
            </div>
          )}
          <button className="btn btn-primary" style={{ background: '#000' }} onClick={() => navigate('/')}>
            Create a New Trip
          </button>
        </section>

        {needsInput.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 className="section-title">Need Your Input</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {needsInput.map(({ trip, day, item }) => (
                <button
                  key={item.id}
                  className="row-between"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 10,
                    border: '1px solid var(--border-soft)',
                    borderRadius: 'var(--radius-md)',
                    gap: 12,
                  }}
                  onClick={() => navigate(`/trip/${trip.id}?tab=itinerary&day=${day.date}&item=${item.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        flexShrink: 0,
                        backgroundImage: `url(${trip.cover})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p className="text-body" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </p>
                      <p
                        style={{
                          margin: '2px 0 0',
                          fontSize: 14,
                          color: 'var(--ink-mute)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {trip.name} · Closes {item.closesAt}
                      </p>
                    </div>
                  </div>
                  <CaretRight size={16} color="var(--ink-mute)" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </section>
        )}

        {pendingConfirmations.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 className="section-title">Confirm Your Decisions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingConfirmations.map(({ trip, day, item }) => (
                <button
                  key={item.id}
                  className="row-between"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 10,
                    border: '1px solid var(--border-soft)',
                    borderRadius: 'var(--radius-md)',
                    gap: 12,
                  }}
                  onClick={() => navigate(`/trip/${trip.id}?tab=itinerary&day=${day.date}&item=${item.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        flexShrink: 0,
                        background: 'var(--surface-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircle size={20} weight="fill" color="var(--success)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p className="text-body" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </p>
                      <p
                        style={{
                          margin: '2px 0 0',
                          fontSize: 14,
                          color: 'var(--ink-mute)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {trip.name} · Winner: {pollWinner(item)?.text}
                      </p>
                    </div>
                  </div>
                  <CaretRight size={16} color="var(--ink-mute)" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </section>
        )}

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="section-title">Trending Itineraries</h2>
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 4,
              margin: '0 -24px',
              padding: '0 24px 4px',
            }}
          >
            {TRENDING.map((t) => (
              <div
                key={t.name}
                style={{
                  flexShrink: 0,
                  width: 150,
                  height: 180,
                  borderRadius: 'var(--radius-card)',
                  padding: 16,
                  display: 'flex',
                  alignItems: 'flex-end',
                  color: '#fff',
                  background: `linear-gradient(180deg, rgba(10,14,18,0.05), rgba(10,14,18,0.7)), url(${t.image}) center/cover`,
                }}
              >
                <p className="text-h3">{t.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="section-title">Past Trips</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {past.map((trip) => (
              <TripCard key={trip.id} trip={trip} onClick={() => navigate(`/trip/${trip.id}`)} dimmed />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function JumpBackInCard({ trip, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        textAlign: 'left',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 80,
        color: '#fff',
        background: `linear-gradient(180deg, rgba(10,14,18,0.15), rgba(10,14,18,0.72)), url(${trip.cover}) center/cover`,
      }}
    >
      <div className="row-between" style={{ width: '100%' }}>
        <span
          style={{
            alignSelf: 'flex-start',
            background: 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(2px)',
            border: '0.5px solid rgba(255,255,255,0.13)',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {trip.badge}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <AvatarStack members={trip.members} size={22} max={4} />
          <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{trip.dateRange}</span>
        </div>
      </div>

      <div className="row-between" style={{ width: '100%', alignItems: 'flex-end' }}>
        <div>
          <p style={{ margin: 0, fontSize: 30, fontWeight: 600, lineHeight: 1.15 }}>Hey Amanda,</p>
          <p style={{ margin: 0, fontSize: 30, fontWeight: 600, lineHeight: 1.15 }}>hope Portugal is</p>
          <p style={{ margin: 0, fontSize: 30, fontWeight: 600, lineHeight: 1.15 }}>treating you well.</p>
          <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
            Jump back in to make the most of your trip
          </p>
        </div>
        <CaretRight size={18} style={{ flexShrink: 0 }} />
      </div>
    </button>
  );
}

function TripCard({ trip, onClick, dimmed = false }) {
  const overlay = dimmed
    ? 'linear-gradient(180deg, rgba(10,14,18,0.35), rgba(10,14,18,0.8))'
    : 'linear-gradient(180deg, rgba(10,14,18,0.15), rgba(10,14,18,0.65))';
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        height: 150,
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        textAlign: 'left',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff',
        background: `${overlay}, url(${trip.cover}) center/cover`,
        filter: dimmed ? 'saturate(0.75)' : 'none',
      }}
    >
      <span
        style={{
          alignSelf: 'flex-start',
          background: 'rgba(0,0,0,0.18)',
          backdropFilter: 'blur(2px)',
          border: '0.5px solid rgba(255,255,255,0.13)',
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {trip.badge}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div>
          <p className="text-h2" style={{ marginBottom: 4 }}>{trip.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AvatarStack members={trip.members} size={22} max={4} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{trip.dateRange}</span>
          </div>
        </div>
        <CaretRight size={18} />
      </div>
    </button>
  );
}
