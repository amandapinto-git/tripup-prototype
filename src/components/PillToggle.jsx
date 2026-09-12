// Two-way segmented control (poll's Vote on it/Set manually, expense
// split's Equally/Custom) — one shared style so both read as the same
// control instead of two different-looking toggles.
export default function PillToggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              borderRadius: 999,
              border: `1px solid ${active ? '#000' : 'rgba(0,0,0,0.1)'}`,
              background: active ? '#000' : '#fff',
              color: active ? '#fff' : '#000',
              fontWeight: active ? 700 : 400,
              fontSize: 12,
              padding: '10px 6px',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
