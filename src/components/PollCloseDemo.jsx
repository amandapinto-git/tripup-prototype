import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripDispatch, useTripState } from '../state/TripContext';
import NotificationBanner from './NotificationBanner';

// Prototype-only demo script: simulates the "Dinner Restaurant Tokyo" poll's
// closing rule firing 10s after load, and shows a push-notification mockup
// announcing it — a stand-in for a real backend timer + push notification.
const DEMO_TRIP_ID = 'portugal';
const DEMO_POLL_ID = 'poll-1';
const DEMO_DAY = '2026-05-17';

export default function PollCloseDemo() {
  const { trips } = useTripState();
  const dispatch = useTripDispatch();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const firedRef = useRef(false);

  const trip = trips.find((t) => t.id === DEMO_TRIP_ID);
  const poll = trip?.itinerary.flatMap((d) => d.items).find((i) => i.id === DEMO_POLL_ID);

  useEffect(() => {
    if (!poll || poll.closedOverride || poll.decided || firedRef.current) return;
    const timer = setTimeout(() => {
      firedRef.current = true;
      dispatch({ type: 'MARK_POLL_CLOSED', tripId: DEMO_TRIP_ID, pollId: DEMO_POLL_ID });
      setVisible(true);
    }, 10000);
    return () => clearTimeout(timer);
    // Only ever schedules once per fresh (unclosed) poll state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!poll]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 7000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!poll) return null;

  return (
    <NotificationBanner
      visible={visible}
      title="Poll closed"
      subtitle={`${poll.title} — tap to see the result`}
      onDismiss={() => setVisible(false)}
      onTap={() => {
        setVisible(false);
        navigate(`/trip/${DEMO_TRIP_ID}?tab=itinerary&day=${DEMO_DAY}&item=${DEMO_POLL_ID}`);
      }}
    />
  );
}
