// Known airline wordmarks, keyed by the exact `airline` string in seed data.
// Anything not in this table falls back to plain italic text so a real
// "add a flight" flow (which won't have a matching logo asset) still works.
const LOGOS = {
  Emirates: { black: 'emirates-black.png', white: 'emirates-white.png' },
};

export default function AirlineLogo({ airline, variant = 'black', height = 18 }) {
  const file = LOGOS[airline]?.[variant];
  if (!file) {
    return (
      <span style={{ fontSize: 18, fontWeight: 600, fontStyle: 'italic' }}>{airline}</span>
    );
  }
  return <img src={`${import.meta.env.BASE_URL}${file}`} alt={airline} style={{ height, display: 'block' }} />;
}
