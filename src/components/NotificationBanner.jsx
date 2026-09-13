import { Bell } from '@phosphor-icons/react';

// Plain CSS transition rather than framer-motion's AnimatePresence — kept
// permanently mounted and toggled via opacity/transform so there's no
// mount/unmount timing to get wrong.
export default function NotificationBanner({ visible, title, subtitle, onTap, onDismiss }) {
  return (
    <div
      onClick={visible ? onTap : undefined}
      role="button"
      tabIndex={visible ? 0 : -1}
      style={{
        position: 'fixed',
        top: 'max(10px, calc(env(safe-area-inset-top, 0px) + 6px))',
        left: 10,
        right: 10,
        zIndex: 40,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        textAlign: 'left',
        padding: '12px 14px',
        borderRadius: 'var(--notif-radius, 16px)',
        background: 'rgba(255, 255, 255, 0.68)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(255,255,255,0.5)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        color: '#000',
        cursor: visible ? 'pointer' : 'default',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-80px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.2, 0.8, 0.3, 1)',
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Bell size={24} weight="fill" color="#fff" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{title}</p>
        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 400, color: 'rgba(0,0,0,0.6)' }}>{subtitle}</p>
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.45)', flexShrink: 0, marginTop: 2 }}
      >
        Dismiss
      </button>
    </div>
  );
}
