import Avatar from './Avatar';
import { YOU_ID } from '../data/seed';

const chipStyle = (selected) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0,
  margin: 0,
  padding: '6px 14px 6px 6px',
  borderRadius: 999,
  background: selected ? '#000' : 'transparent',
  border: `1px solid ${selected ? '#000' : 'var(--border)'}`,
});

// The one member-chip look shared by "who paid" (single-select — onToggle
// just replaces the selection) and "who had this item" (multi-select —
// onToggle adds/removes) so both feel like the same control. `onToggleAll`
// adds a leading "All" chip — every item on a scanned bill defaults to
// everyone already, but this makes it just as fast to select/clear
// everyone again after picking through individual names.
export default function MemberChipRow({ members, selectedIds, onToggle, onToggleAll }) {
  const allSelected = members.every((m) => selectedIds.includes(m.id));
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: 0, padding: 0 }}>
      {onToggleAll && (
        <button onClick={onToggleAll} style={chipStyle(allSelected)}>
          <span style={{ fontSize: 14, fontWeight: 600, color: allSelected ? '#fff' : 'var(--ink)', whiteSpace: 'nowrap' }}>
            All
          </span>
        </button>
      )}
      {members.map((m) => {
        const selected = selectedIds.includes(m.id);
        return (
          <button key={m.id} onClick={() => onToggle(m.id)} style={chipStyle(selected)}>
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
