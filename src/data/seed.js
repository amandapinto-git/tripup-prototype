export const AVATAR_COLORS = [
  '#5190a9',
  '#5aa63f',
  '#d19ad2',
  '#ddae40',
  '#c66f6f',
  '#8b7fd6',
  '#4fb3a9',
];

export const YOU_ID = 'you';

const members = [
  { id: YOU_ID, name: 'You', initial: 'Y', color: '#16202a' },
  { id: 'anna', name: 'Anna', initial: 'A', color: AVATAR_COLORS[0] },
  { id: 'melanie', name: 'Melanie', initial: 'M', color: AVATAR_COLORS[1] },
  { id: 'vera', name: 'Vera', initial: 'V', color: AVATAR_COLORS[2] },
  { id: 'jen', name: 'Jen', initial: 'J', color: AVATAR_COLORS[3] },
  { id: 'natasha', name: 'Natasha', initial: 'N', color: AVATAR_COLORS[4] },
];

const CATEGORY_META = {
  food: { label: 'Food', icon: 'ForkKnife' },
  stay: { label: 'Stay', icon: 'Bed' },
  transport: { label: 'Transport', icon: 'AirplaneTilt' },
  activities: { label: 'Activities', icon: 'Ticket' },
};

export { CATEGORY_META };

const portugalItinerary = [
  {
    date: '2026-05-12',
    label: 'Tue, May 12',
    items: [
      {
        id: 'it-2',
        type: 'flight',
        title: 'Emirates · EK301',
        time: '07:00',
        airline: 'Emirates',
        outbound: {
          code: 'EK301',
          from: { code: 'DXB', city: 'Dubai', time: '07:00' },
          to: { code: 'LIS', city: 'Lisbon', time: '13:30' },
        },
        returnLeg: {
          code: 'EK321',
          from: { code: 'LIS', city: 'Lisbon', time: '18:20' },
          to: { code: 'DXB', city: 'Dubai', time: '08:20' },
        },
      },
      {
        id: 'it-1',
        type: 'hotel',
        title: 'LX Boutique Hotel Lisbon',
        location: 'Rua do Alecrim 12, Lisbon',
        time: 'Check in starts from 16:00',
      },
      {
        id: 'it-3',
        type: 'activity',
        title: 'Chiado and Bairro Alto',
        location: 'Chiado, Lisbon',
        time: '16:30',
      },
      {
        id: 'it-3b',
        type: 'food',
        title: 'Cervejaria Ramiro',
        location: 'Av. Almirante Reis 1, Lisbon',
        time: '20:00',
      },
    ],
  },
  {
    date: '2026-05-13',
    label: 'Wed, May 13',
    highlightId: 'it-6',
    items: [
      {
        id: 'it-4',
        type: 'hotel',
        title: 'LX Boutique Hotel Lisbon',
        location: 'Rua do Alecrim 12, Lisbon',
        time: 'Day 2',
      },
      {
        id: 'it-5',
        type: 'activity',
        title: 'Belem Tower and Jeronimos Monastery',
        location: 'Belém, Lisbon',
        time: '11:00',
      },
      {
        id: 'it-6',
        type: 'food',
        title: 'Timeout Market Lisboa',
        location: 'Av. 24 de Julho 49, Lisbon',
        time: '14:00',
        image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop',
        description:
          "Lisbon's biggest food hall, home to stalls run by some of the city's top chefs under one roof. A group-friendly stop where everyone can order something different.",
      },
      {
        id: 'it-6b',
        type: 'activity',
        title: 'LX Factory',
        location: 'R. Rodrigues de Faria 103, Lisbon',
        time: '17:00',
      },
      {
        id: 'it-7',
        type: 'activity',
        title: 'Sunset at Miradouro de Santa Catarina',
        location: 'Miradouro de Santa Catarina, Lisbon',
        time: '18:00',
      },
    ],
  },
  {
    date: '2026-05-14',
    label: 'Thu, May 14',
    items: [
      {
        id: 'it-8',
        type: 'hotel',
        title: 'LX Boutique Hotel Lisbon',
        location: 'Rua do Alecrim 12, Lisbon',
        time: 'Day 3',
      },
      {
        id: 'it-13',
        type: 'activity',
        title: 'Day Trip to Sintra: Pena Palace',
        location: 'Pena Palace, Sintra',
        time: '09:00',
      },
      {
        id: 'it-14',
        type: 'food',
        title: 'Lunch in Sintra Old Town',
        location: 'Sintra Historic Centre',
        time: '13:00',
      },
      {
        id: 'it-15',
        type: 'activity',
        title: 'Cabo da Roca Viewpoint',
        location: 'Cabo da Roca, Colares',
        time: '16:00',
      },
    ],
  },
  {
    date: '2026-05-15',
    label: 'Fri, May 15',
    items: [
      {
        id: 'it-9',
        type: 'hotel',
        title: 'LX Boutique Hotel Lisbon',
        location: 'Rua do Alecrim 12, Lisbon',
        time: 'Day 4',
      },
      {
        id: 'it-16',
        type: 'activity',
        title: 'Alfama Walking Tour',
        location: 'Largo das Portas do Sol, Lisbon',
        time: '10:00',
      },
      {
        id: 'it-17',
        type: 'activity',
        title: 'São Jorge Castle',
        location: 'R. de Santa Cruz do Castelo, Lisbon',
        time: '13:00',
      },
      {
        id: 'it-18',
        type: 'food',
        title: 'Fado Show and Dinner',
        location: 'Rua de São João da Praça, Lisbon',
        time: '20:00',
      },
    ],
  },
  {
    date: '2026-05-16',
    label: 'Sat, May 16',
    items: [
      {
        id: 'it-10',
        type: 'hotel',
        title: 'LX Boutique Hotel Lisbon',
        location: 'Rua do Alecrim 12, Lisbon',
        time: 'Day 5',
      },
      {
        id: 'it-19',
        type: 'activity',
        title: 'Cascais Beach Day',
        location: 'Praia da Conceição, Cascais',
        time: '10:00',
      },
      {
        id: 'it-20',
        type: 'food',
        title: 'Seafood Lunch in Cascais',
        location: 'Rua Frederico Arouca, Cascais',
        time: '13:30',
      },
    ],
  },
  {
    date: '2026-05-17',
    label: 'Sun, May 17',
    items: [
      {
        id: 'it-11',
        type: 'hotel',
        title: 'LX Boutique Hotel Lisbon',
        location: 'Rua do Alecrim 12, Lisbon',
        time: 'Day 6',
      },
      {
        id: 'it-21',
        type: 'activity',
        title: 'LX Market and Shopping',
        location: 'Av. da Liberdade, Lisbon',
        time: '11:00',
      },
      {
        id: 'poll-1',
        type: 'poll',
        category: 'food',
        title: 'Dinner Restaurant Lisbon',
        closesAt: '6:00 PM tonight',
        decided: false,
        createdBy: YOU_ID,
        options: [
          { id: 'opt-1', text: 'Taberna Ideal', votes: ['anna', 'melanie', 'jen', 'natasha'] },
          { id: 'opt-2', text: 'Cervejaria Trindade', votes: [] },
          { id: 'opt-3', text: 'Taberna da Rua das Flores', votes: ['vera'] },
        ],
      },
    ],
  },
  {
    date: '2026-05-18',
    label: 'Mon, May 18',
    items: [
      {
        id: 'it-12',
        type: 'hotel',
        title: 'LX Boutique Hotel Lisbon',
        location: 'Rua do Alecrim 12, Lisbon',
        time: 'Check out by 11:00',
      },
      {
        id: 'it-22',
        type: 'flight',
        title: 'Emirates · EK321',
        time: '18:20',
        airline: 'Emirates',
        outbound: {
          code: 'EK321',
          from: { code: 'LIS', city: 'Lisbon', time: '18:20' },
          to: { code: 'DXB', city: 'Dubai', time: '08:20' },
        },
      },
    ],
  },
];

const portugalExpenses = [
  {
    id: 'ex-1',
    description: 'Flights (group booking)',
    amount: 1600,
    category: 'transport',
    paidBy: 'anna',
    splitType: 'equal',
    splitWith: ['you', 'anna', 'melanie', 'vera', 'jen', 'natasha'],
    date: '2026-05-10T10:00:00Z',
  },
  {
    id: 'ex-2',
    description: 'LX Boutique Hotel Lisbon',
    amount: 900,
    category: 'stay',
    paidBy: YOU_ID,
    splitType: 'equal',
    splitWith: ['you', 'anna', 'melanie', 'vera', 'jen', 'natasha'],
    date: '2026-05-11T10:00:00Z',
  },
  {
    id: 'ex-3',
    description: 'Dinner at Cervejaria Ramiro',
    amount: 64,
    category: 'food',
    paidBy: 'anna',
    splitType: 'equal',
    splitWith: ['you', 'anna', 'melanie', 'vera'],
    date: '2026-05-12T20:00:00Z',
    itineraryItemId: 'it-3',
  },
  {
    id: 'ex-4',
    description: 'Belem Tower tickets',
    amount: 240,
    category: 'activities',
    paidBy: 'jen',
    splitType: 'equal',
    splitWith: ['you', 'anna', 'melanie', 'vera', 'jen', 'natasha'],
    date: '2026-05-13T11:00:00Z',
    itineraryItemId: 'it-5',
  },
  {
    id: 'ex-5',
    description: 'Timeout Market lunch',
    amount: 96,
    category: 'food',
    paidBy: 'natasha',
    splitType: 'equal',
    splitWith: ['you', 'anna', 'melanie', 'vera', 'jen', 'natasha'],
    date: '2026-05-13T14:00:00Z',
    itineraryItemId: 'it-6',
  },
  {
    id: 'ex-6',
    description: 'Taxi to Belem',
    amount: 60,
    category: 'transport',
    paidBy: 'melanie',
    splitType: 'equal',
    splitWith: ['you', 'anna', 'melanie'],
    date: '2026-05-13T09:00:00Z',
  },
];

export const trips = [
  {
    id: 'portugal',
    name: 'Girls’ Trip to Portugal',
    cover:
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1200&auto=format&fit=crop',
    dateRange: 'May 12 - 18, 2026',
    start: '2026-05-12',
    end: '2026-05-18',
    badge: 'Day 2',
    currentDate: '2026-05-13',
    status: 'current',
    members,
    itinerary: portugalItinerary,
    expenses: portugalExpenses,
    recentActivity: [
      { id: 'act-1', memberId: 'anna', verb: 'added', subject: 'Dinner at Cervejaria Ramiro', when: '2 days ago' },
      { id: 'act-2', memberId: 'jen', verb: 'booked', subject: 'LX Boutique Hotel Lisbon', when: '3 days ago' },
      { id: 'act-3', memberId: YOU_ID, verb: 'added the', subject: 'DXB → LIS flight', when: '4 days ago' },
    ],
  },
  {
    id: 'montenegro',
    name: 'Trip to Montenegro',
    cover:
      'https://images.unsplash.com/photo-1614122027743-50a9e6e8002f?q=80&w=1200&auto=format&fit=crop',
    dateRange: 'Aug 21 - 29, 2026',
    start: '2026-08-21',
    end: '2026-08-29',
    badge: '103 days away',
    status: 'upcoming',
    members: members.slice(0, 3),
    itinerary: [
      {
        date: '2026-08-21',
        label: 'Fri, Aug 21',
        items: [
          {
            id: 'mn-1',
            type: 'poll',
            category: 'hotel',
            title: 'Which villa should we book?',
            closesAt: 'Fri 9:00 PM',
            decided: false,
            createdBy: YOU_ID,
            options: [
              { id: 'mn-opt-1', text: 'Seaview Villa Kotor', votes: ['anna', YOU_ID] },
              { id: 'mn-opt-2', text: 'Budva Old Town Loft', votes: ['melanie'] },
            ],
          },
        ],
      },
    ],
    expenses: [],
  },
  {
    id: 'vegas',
    name: 'New Year’s Eve in Vegas',
    cover:
      'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?q=80&w=1200&auto=format&fit=crop',
    dateRange: 'Dec 30, 2025 - Jan 3, 2026',
    start: '2025-12-30',
    end: '2026-01-03',
    badge: 'Past trip',
    status: 'past',
    members: members.slice(0, 4),
    itinerary: [],
    expenses: [],
  },
];

export const allMembers = members;
