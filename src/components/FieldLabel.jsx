// The one text style used above every input/section across the add-event
// and add-expense flows, so labels never drift into different sizes,
// weights, or colors between the two.
export default function FieldLabel({ children }) {
  return <p style={{ margin: 0, fontSize: 12, fontWeight: 400, color: '#5d5d5d' }}>{children}</p>;
}
