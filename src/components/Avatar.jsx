export default function Avatar({ member, size = 36, style }) {
  if (!member) return null;
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: member.color,
        fontSize: size <= 24 ? 10 : 12,
        ...style,
      }}
    >
      {member.initial}
    </div>
  );
}

export function AvatarStack({ members, max = 4, size = 24 }) {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <Avatar
          key={m.id}
          member={m}
          size={size}
          style={{ marginLeft: i === 0 ? 0 : -8, border: '2px solid #fff' }}
        />
      ))}
      {overflow > 0 && (
        <div
          className="avatar"
          style={{
            width: size,
            height: size,
            marginLeft: -8,
            background: '#e3e3e3',
            color: '#666',
            fontSize: 10,
            border: '2px solid #fff',
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
