/* eslint-disable react-refresh/only-export-components */
import FieldLabel from './FieldLabel';

// The large, bottom-border-only field used for a screen's headline input
// (poll question, expense description/amount) — shared so both flows use
// the exact same text size, weight, and underline treatment.
export default function UnderlineField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 8 }}>{children}</div>
    </div>
  );
}

export function underlineInputStyle(extra) {
  return {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 22,
    fontWeight: 400,
    color: '#000',
    padding: 0,
    ...extra,
  };
}
