/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { trips as seedTrips, YOU_ID } from '../data/seed';

// Only matches a clean 24-hour "HH:MM" — every itinerary item that has an
// actual clock time uses that format, so anything else (a hotel's "Check
// in starts from 16:00", "Day 2", "Time TBD") is left where it was rather
// than guessed at.
function parseTimeToMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec((time || '').trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

// New items land at the right point in the day instead of always at the
// bottom, ordered against whatever else already has a comparable time.
function insertByTime(items, item) {
  const minutes = parseTimeToMinutes(item.time);
  if (minutes === null) return [...items, item];
  const index = items.findIndex((existing) => {
    const existingMinutes = parseTimeToMinutes(existing.time);
    return existingMinutes !== null && existingMinutes > minutes;
  });
  return index === -1 ? [...items, item] : [...items.slice(0, index), item, ...items.slice(index)];
}

// Bump this whenever the seed/trip data shape changes so stale localStorage
// from an earlier prototype iteration can't crash the app on load.
const STORAGE_KEY = 'tripup-state-v16';

// Every poll resets to its seed state on load, not just the one scripted
// demo poll (see PollCloseDemo.jsx) — any poll created live during a demo
// session (votes cast, confirmed, discarded, or added from scratch via
// AddPlanFlow) shouldn't pile up in localStorage and clutter the next run.
// A poll that exists in seed data comes back fresh; one that doesn't
// (created live) simply disappears.
function resetPolls(trips) {
  return trips.map((trip) => {
    const seedTrip = seedTrips.find((t) => t.id === trip.id);
    if (!seedTrip) return trip;

    return {
      ...trip,
      itinerary: trip.itinerary.map((day) => {
        const seedDay = seedTrip.itinerary.find((d) => d.date === day.date);
        const seedPolls = (seedDay?.items || []).filter((i) => i.type === 'poll').map((i) => ({ ...i }));
        const nonPollItems = day.items.filter((item) => item.type !== 'poll');
        return { ...day, items: [...nonPollItems, ...seedPolls] };
      }),
    };
  });
}

// Expenses (and settlements) added during a demo session shouldn't pile up
// forever in localStorage — each trip's expense list resets to its seed
// state on every load, same as the demo poll.
function resetExpenses(trips) {
  return trips.map((trip) => {
    const seedTrip = seedTrips.find((t) => t.id === trip.id);
    return seedTrip ? { ...trip, expenses: seedTrip.expenses } : trip;
  });
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...parsed, trips: resetExpenses(resetPolls(parsed.trips)) };
    }
  } catch {
    // ignore corrupted storage
  }
  return { trips: seedTrips };
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_EXPENSE': {
      const { tripId, expense } = action;
      return {
        ...state,
        trips: state.trips.map((trip) =>
          trip.id === tripId ? { ...trip, expenses: [expense, ...trip.expenses] } : trip
        ),
      };
    }
    case 'VOTE_POLL': {
      const { tripId, pollId, memberId, optionId } = action;
      return {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          return {
            ...trip,
            itinerary: trip.itinerary.map((day) => ({
              ...day,
              items: day.items.map((item) => {
                if (item.id !== pollId || item.type !== 'poll') return item;
                const alreadyOnTarget = item.options.find((o) => o.id === optionId)?.votes.includes(memberId);
                return {
                  ...item,
                  options: item.options.map((opt) => {
                    const withoutMember = opt.votes.filter((v) => v !== memberId);
                    if (opt.id === optionId && !alreadyOnTarget) {
                      return { ...opt, votes: [...withoutMember, memberId] };
                    }
                    return { ...opt, votes: withoutMember };
                  }),
                };
              }),
            })),
          };
        }),
      };
    }
    case 'CONFIRM_POLL': {
      // Nothing is written until the creator confirms — this is the one
      // place a poll's result actually becomes final.
      const { tripId, pollId, location } = action;
      return {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          const activityEntry = {
            id: `act-${Date.now()}`,
            memberId: YOU_ID,
            verb: 'confirmed poll winner',
            subject: location?.name || 'the poll',
            when: 'Today',
          };
          return {
            ...trip,
            itinerary: trip.itinerary.map((day) => ({
              ...day,
              items: day.items.map((item) =>
                item.id === pollId && item.type === 'poll'
                  ? { ...item, decided: true, confirmedLocation: location }
                  : item
              ),
            })),
            recentActivity: [activityEntry, ...(trip.recentActivity || [])],
          };
        }),
      };
    }
    case 'DISCARD_POLL': {
      const { tripId, pollId } = action;
      return {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          return {
            ...trip,
            itinerary: trip.itinerary.map((day) => ({
              ...day,
              items: day.items.filter((item) => item.id !== pollId),
            })),
          };
        }),
      };
    }
    case 'REMOVE_ITINERARY_ITEM': {
      const { tripId, itemId } = action;
      return {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          return {
            ...trip,
            itinerary: trip.itinerary.map((day) => ({
              ...day,
              items: day.items.filter((item) => item.id !== itemId),
            })),
          };
        }),
      };
    }
    case 'MARK_POLL_CLOSED': {
      // Simulates the poll's own closing rule firing (e.g. the scheduled
      // time passing) — independent of whether every member has voted, so
      // a demo notification can announce "closed" without needing everyone
      // to actually cast a vote first.
      const { tripId, pollId } = action;
      return {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          return {
            ...trip,
            itinerary: trip.itinerary.map((day) => ({
              ...day,
              items: day.items.map((item) =>
                item.id === pollId && item.type === 'poll' ? { ...item, closedOverride: true } : item
              ),
            })),
          };
        }),
      };
    }
    case 'ADD_ITINERARY_ITEM': {
      const { tripId, date, dayLabel, item } = action;
      return {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          const dayExists = trip.itinerary.some((d) => d.date === date);
          const itinerary = dayExists
            ? trip.itinerary.map((d) => (d.date === date ? { ...d, items: insertByTime(d.items, item) } : d))
            : [...trip.itinerary, { date, label: dayLabel, items: [item] }].sort((a, b) =>
                a.date.localeCompare(b.date)
              );
          return { ...trip, itinerary };
        }),
      };
    }
    case 'SETTLE': {
      const { tripId, memberId, you, amount } = action;
      const expense = {
        id: `settle-${Date.now()}-${memberId}`,
        description: 'Settled up',
        amount,
        category: 'settle',
        paidBy: you,
        date: new Date().toISOString(),
        isSettlement: true,
        settledWith: memberId,
      };
      return {
        ...state,
        trips: state.trips.map((trip) =>
          trip.id === tripId ? { ...trip, expenses: [expense, ...trip.expenses] } : trip
        ),
      };
    }
    case 'ADD_MEMBER': {
      const { tripId, member } = action;
      return {
        ...state,
        trips: state.trips.map((trip) =>
          trip.id === tripId
            ? trip.members.some((m) => m.id === member.id)
              ? trip
              : { ...trip, members: [...trip.members, member] }
            : trip
        ),
      };
    }
    case 'REMOVE_MEMBER': {
      const { tripId, memberId } = action;
      return {
        ...state,
        trips: state.trips.map((trip) =>
          trip.id === tripId ? { ...trip, members: trip.members.filter((m) => m.id !== memberId) } : trip
        ),
      };
    }
    case 'RESET':
      return { trips: seedTrips };
    default:
      return state;
  }
}

const TripStateContext = createContext(null);
const TripDispatchContext = createContext(null);

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable, safe to ignore for a prototype
    }
  }, [state]);

  const value = useMemo(() => state, [state]);

  return (
    <TripStateContext.Provider value={value}>
      <TripDispatchContext.Provider value={dispatch}>{children}</TripDispatchContext.Provider>
    </TripStateContext.Provider>
  );
}

export function useTripState() {
  const ctx = useContext(TripStateContext);
  if (!ctx) throw new Error('useTripState must be used within TripProvider');
  return ctx;
}

export function useTripDispatch() {
  const ctx = useContext(TripDispatchContext);
  if (!ctx) throw new Error('useTripDispatch must be used within TripProvider');
  return ctx;
}

export function useTrip(tripId) {
  const { trips: allTrips } = useTripState();
  return allTrips.find((t) => t.id === tripId);
}
