// A poll closes once every member has voted somewhere — the "1 hour before
// scheduled time" rule from the create-poll flow isn't modeled with a real
// timestamp today, so this only implements the "everyone's input is in"
// case, which is all the seed data currently exercises.
export function isPollClosed(poll, members) {
  if (poll.closedOverride) return true;
  const votedIds = new Set(poll.options.flatMap((o) => o.votes));
  return members.every((m) => votedIds.has(m.id));
}

export function pollWinner(poll) {
  return poll.options.reduce((best, opt) => (opt.votes.length > (best?.votes.length ?? -1) ? opt : best), null);
}

// Prototype stand-in for a real place-search/resolution step: a small
// known-place table. Anything not in it simulates "couldn't find a match"
// so the no-match confirmation path is reachable too. `reservationUrl` is
// a second, independent lookup — a place can be found without a bookable
// link, which is exactly the case this is meant to demo.
const KNOWN_PLACES = {
  'Taberna Ideal': {
    name: 'Taberna Ideal',
    address: 'Rua Ivens 55, Lisbon',
    time: '20:00',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
    reservationUrl: 'https://www.sevenrooms.com/reservations/tabernaideal',
  },
};

export function resolveLocation(optionText) {
  return KNOWN_PLACES[optionText] || null;
}

export function resolveReservation(optionText) {
  return KNOWN_PLACES[optionText]?.reservationUrl || null;
}
