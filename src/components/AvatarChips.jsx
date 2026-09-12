export default function AvatarChips({ members, size = 24, max = 4, textColor = '#fff' }) {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <div style={{ display: 'flex' }}>
        {shown.map((m, i) => (
          <div
            key={m.id}
            style={{
              width: size,
              height: size,
              marginRight: i === shown.length - 1 ? 0 : -6,
              borderRadius: size / 2,
              background: m.color,
              border: '0.7px solid rgba(255,255,255,0.19)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: size <= 20 ? 11 : 13,
              fontWeight: 600,
              lineHeight: 1,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {m.initial}
          </div>
        ))}
      </div>
      {overflow > 0 && (
        <span style={{ fontSize: size <= 20 ? 11 : 12, fontWeight: 600, color: textColor }}>+{overflow}</span>
      )}
    </div>
  );
}
