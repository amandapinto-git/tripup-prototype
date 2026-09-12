import { SquaresFour, BookOpen, Invoice } from '@phosphor-icons/react';

const TABS = [
  { id: 'overview', label: 'Overview', Icon: SquaresFour },
  { id: 'itinerary', label: 'Itineraries', Icon: BookOpen },
  { id: 'expenses', label: 'Expenses', Icon: Invoice },
];

export default function TabPills({ active, onChange, onPhoto = false }) {
  return (
    <div className={`pill-nav${onPhoto ? ' on-photo' : ''}`}>
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={active === id ? 'active' : ''}
          onClick={() => onChange(id)}
          type="button"
        >
          <Icon size={15} weight={active === id ? 'fill' : 'regular'} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
