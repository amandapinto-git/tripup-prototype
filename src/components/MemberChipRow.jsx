import Avatar from './Avatar';
import { YOU_ID } from '../data/seed';

// The one member-chip look shared by "who paid" (single-select — onToggle
// just replaces the selection) and "who had this item" (multi-select —
// onToggle adds/removes) so both feel like the same control.
export default function MemberChipRow({ members, selectedIds, onToggle }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
      {members.map((m) => {
        const selected = selectedIds.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
              padding: '6px 14px 6px 6px',
              borderRadius: 999,
              background: selected ? '#000' : 'transparent',
              border: `1px solid ${selected ? '#000' : 'var(--border)'}`,
            }}
          >
            <Avatar member={m} size={26} />
            <span style={{ fontSize: 14, fontWeight: 600, color: selected ? '#fff' : 'var(--ink)', whiteSpace: 'nowrap' }}>
              {m.id === YOU_ID ? 'You' : m.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
