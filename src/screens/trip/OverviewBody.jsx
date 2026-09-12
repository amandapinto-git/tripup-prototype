import { useNavigate } from 'react-router-dom';
import { Plus, AirplaneTakeoff, Bed, ForkKnife, Ticket, CaretRight } from '@phosphor-icons/react';
import AvatarChips from '../../components/AvatarChips';
import Avatar from '../../components/Avatar';
import CategoryIcon from '../../components/CategoryIcon';

const TODAY_ICONS = {
  hotel: Bed,
  food: ForkKnife,
  flight: AirplaneTakeoff,
  activity: Ticket,
  poll: Ticket,
};

function daysUntil(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff > 1) return `${diff} days to go`;
  if (diff === 1) return '1 day to go';
  if (diff === 0) return 'Starts today';
  return 'In progress';
}

function findOpenDays(trip) {
  return trip.itinerary
    .filter((day) => day.items.length < 2)
    .map((day) => ({ date: day.date, label: day.label, dayLabel: day.label }));
}

export default function OverviewBody({ trip }) {
  const navigate = useNavigate();
  const essentials = trip.itinerary.flatMap((d) => d.items).filter((i) => i.type !== 'poll');
  const flight = essentials.find((i) => i.type === 'flight');
  const hotel = essentials.find((i) => i.type === 'hotel');
  const activity = trip.recentActivity || [];
  const openDays = findOpenDays(trip);
  const today = trip.itinerary.find((d) => d.date === trip.currentDate);
  const todayItems = (today?.items || []).filter((i) => i.type !== 'poll');

  const statusLine = today && trip.badge ? `${trip.badge}, ${daysUntil(trip.start)}` : daysUntil(trip.start);

  return (
    <div style={{ padding: '36px 24px 24px', display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="row-between">
          <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{statusLine}</p>
          {today && (
            <button
              onClick={() => navigate(`/trip/${trip.id}?tab=itinerary&day=${trip.currentDate}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--ink-mute)' }}
            >
              View itinerary <CaretRight size={12} weight="bold" />
            </button>
          )}
        </div>
        {today && (
          todayItems.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-mute)' }}>Nothing planned yet.</p>
          ) : (
            <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              {todayItems.map((item, i) => {
                const Icon = TODAY_ICONS[item.type] || Ticket;
                return (
                  <div key={item.id}>
                    {i > 0 && <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }} />}
                    <button
                      onClick={() =>
                        navigate(`/trip/${trip.id}?tab=itinerary&day=${trip.currentDate}&item=${item.id}`)
                      }
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', textAlign: 'left' }}
                    >
                      <Icon size={16} weight="regular" style={{ flexShrink: 0 }} />
                      <p
                        style={{
                          flex: 1,
                          minWidth: 0,
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#000',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </p>
                      <span style={{ fontSize: 13, color: 'var(--ink-mute)', flexShrink: 0 }}>{item.time}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p className="section-title">Trip Essentials</p>
        {!flight && !hotel && (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-mute)' }}>Nothing booked yet.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {flight && <FlightTicketCard item={flight} members={trip.members} />}
          {hotel && (
            <div style={{ background: '#000', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.13)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CategoryIcon category="stay" size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>{hotel.title}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: '#fff' }}>{hotel.time}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activity.length > 0 && (
        <div>
          <p className="section-title" style={{ marginBottom: 12 }}>Recent Activity</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activity.map((a, i) => {
              const member = trip.members.find((m) => m.id === a.memberId);
              return (
                <div key={a.id}>
                  {i > 0 && <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }} />}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0' }}>
                    <Avatar member={member} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: '#000' }}>
                        <strong style={{ fontWeight: 600 }}>{member?.id === 'you' ? 'You' : member?.name}</strong> {a.verb}{' '}
                        <strong style={{ fontWeight: 600 }}>{a.subject}</strong>
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 400, color: 'rgba(0,0,0,0.38)' }}>{a.when}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {openDays.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p className="section-title">Suggested Actions</p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {openDays.map((day) => (
              <button
                key={day.date}
                onClick={() =>
                  navigate(`/trip/${trip.id}/add-plan?date=${day.date}&label=${encodeURIComponent(day.dayLabel)}`)
                }
                className="suggested-card"
                style={{
                  flexShrink: 0,
                  width: 150,
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 16,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  alignItems: 'flex-start',
                  background: 'transparent',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    border: '1px solid rgba(0,0,0,0.18)',
                    borderRadius: 999,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Plus size={12} color="#000" weight="bold" />
                </span>
                <span style={{ width: '100%' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#000' }}>{day.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.42)' }}>
                    is wide open
                  </p>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FlightTicketCard({ item, members }) {
  return (
    <div style={{ background: '#000', borderRadius: 12, padding: 20, color: '#fff', overflow: 'hidden' }}>
      <div className="row-between">
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600, fontStyle: 'italic' }}>{item.airline}</p>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>Flight Code: {item.outbound.code}</p>
        </div>
        <AvatarChips members={members} size={24} max={4} />
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FlightLeg leg={item.outbound} />
        <div className="ticket-divider" />
        <FlightLeg leg={item.returnLeg} />
      </div>
    </div>
  );
}

function FlightLeg({ leg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 19 }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14 }}>{leg.from.time}</p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{leg.from.code}</p>
        <p style={{ margin: 0, fontSize: 14 }}>{leg.from.city}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 16 }}>
        <span style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.4)' }} />
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            border: '0.5px solid #fff',
            background: 'rgba(255,255,255,0.13)',
            borderRadius: 999,
            padding: '4px 10px',
          }}
        >
          <AirplaneTakeoff size={10} />
          <span style={{ fontSize: 14 }}>{leg.code}</span>
        </span>
        <span style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.4)' }} />
      </div>
      <div style={{ flex: 1, textAlign: 'right' }}>
        <p style={{ margin: 0, fontSize: 14 }}>{leg.to.time}</p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{leg.to.code}</p>
        <p style={{ margin: 0, fontSize: 14 }}>{leg.to.city}</p>
      </div>
    </div>
  );
}
