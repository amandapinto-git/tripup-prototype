import CategoryIcon from './CategoryIcon';

const CATEGORIES = ['food', 'stay', 'transport', 'activities'];

export default function CategoryPicker({ selected, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {CATEGORIES.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            flex: 1,
            border: `1.5px solid ${selected === key ? '#000' : 'var(--border)'}`,
            background: selected === key ? '#000' : 'transparent',
            color: selected === key ? '#fff' : 'var(--ink-soft)',
            borderRadius: 10,
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CategoryIcon category={key} size={16} />
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{key}</span>
        </button>
      ))}
    </div>
  );
}
