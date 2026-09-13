import { useEffect, useRef } from 'react';
import { useTripDispatch, useTripState } from '../state/TripContext';
import { useNotify } from '../state/NotificationContext';

// Prototype-only demo script: simulates the "Dinner Restaurant Tokyo" poll's
// closing rule firing 10s after load, and shows a push-notification mockup
// announcing it — a stand-in for a real backend timer + push notification.
const DEMO_TRIP_ID = 'portugal';
const DEMO_POLL_ID = 'poll-1';
const DEMO_DAY = '2026-05-17';

export default function PollCloseDemo() {
  const { trips } = useTripState();
  const dispatch = useTripDispatch();
  const notify = useNotify();
  const firedRef = useRef(false);

  const trip = trips.find((t) => t.id === DEMO_TRIP_ID);
  const poll = trip?.itinerary.flatMap((d) => d.items).find((i) => i.id === DEMO_POLL_ID);

  useEffect(() => {
    if (!poll || poll.closedOverride || poll.decided || firedRef.current) return;
    const timer = setTimeout(() => {
      firedRef.current = true;
      dispatch({ type: 'MARK_POLL_CLOSED', tripId: DEMO_TRIP_ID, pollId: DEMO_POLL_ID });
      notify({
        title: 'Poll closed',
        subtitle: `${poll.title} — tap to see the result`,
        to: `/trip/${DEMO_TRIP_ID}?tab=itinerary&day=${DEMO_DAY}&item=${DEMO_POLL_ID}`,
      });
    }, 10000);
    return () => clearTimeout(timer);
    // Only ever schedules once per fresh (unclosed) poll state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!poll]);

  return null;
}
