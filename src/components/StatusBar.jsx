export default function StatusBar({ onPhoto = false }) {
  return (
    <div className={`status-bar${onPhoto ? ' on-photo' : ''}`}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, opacity: 0.9 }}>
        <span>●●●●</span>
        <span style={{ width: 22, height: 11, border: '1px solid currentColor', borderRadius: 3, display: 'inline-block' }} />
      </span>
    </div>
  );
}
