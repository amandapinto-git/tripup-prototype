import { X, Camera, PencilSimple } from '@phosphor-icons/react';

export default function AddExpenseMethodDrawer({ onClose, onChoose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Select a way to add an expense</p>
          <button className="icon-btn" style={{ flexShrink: 0 }} onClick={onClose}>
            <X size={16} weight="bold" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="card"
            style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }}
            onClick={() => onChoose('scan')}
          >
            <Camera size={26} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Scan a bill</span>
            <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Auto-fill amount and items</span>
          </button>
          <button
            className="card"
            style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }}
            onClick={() => onChoose('manual')}
          >
            <PencilSimple size={26} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Enter manually</span>
            <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Title, amount and category</span>
          </button>
        </div>
      </div>
    </div>
  );
}
