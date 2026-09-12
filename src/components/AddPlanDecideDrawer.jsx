import { X, Plus, UserSwitch } from '@phosphor-icons/react';

export default function AddPlanDecideDrawer({ onClose, onChoose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Is the plan already decided?</p>
          <button className="icon-btn" style={{ flexShrink: 0 }} onClick={onClose}>
            <X size={16} weight="bold" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="card"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }}
            onClick={() => onChoose('known')}
          >
            <Plus size={24} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>I know what we're doing</span>
            <span style={{ fontSize: 14, color: 'var(--ink-mute)', textAlign: 'center' }}>Add it straight to the plan</span>
          </button>
          <button
            className="card"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }}
            onClick={() => onChoose('vote')}
          >
            <UserSwitch size={24} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Let's decide together</span>
            <span style={{ fontSize: 14, color: 'var(--ink-mute)', textAlign: 'center' }}>Start a vote with options</span>
          </button>
        </div>
      </div>
    </div>
  );
}
