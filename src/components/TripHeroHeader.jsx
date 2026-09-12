import { motion } from 'framer-motion';
import { CaretLeft, UserPlus } from '@phosphor-icons/react';
import StatusBar from './StatusBar';
import TabPills from './TabPills';
import AvatarChips from './AvatarChips';
import { HEADER_SPRING } from '../utils/motion';

export default function TripHeroHeader({ trip, tab, onNavigateTab, onBack, onInvite }) {
  const expanded = tab === 'overview';

  return (
    <motion.div
      layout
      transition={HEADER_SPRING}
      style={{
        position: 'relative',
        flexShrink: 0,
        minHeight: expanded ? 340 : 222,
        paddingBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff',
      }}
    >
      {/* Separate, non-animated clipping layer: a `layout`-animated element
          (which Framer Motion drives via CSS transform) combined with its
          own overflow:hidden + border-radius can fail to clip in Chromium/
          WebKit, so the radius lives on this static wrapper instead. */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '0 0 24px 24px' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 32%, rgba(0,0,0,0.68) 100%), url(${trip.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <StatusBar onPhoto />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 24px 0',
            paddingTop: 'max(8px, calc(env(safe-area-inset-top, 0px) + 10px))',
          }}
        >
          <button className="icon-btn on-photo" onClick={onBack}>
            <CaretLeft size={18} weight="bold" />
          </button>

          <button className="icon-btn on-photo" onClick={onInvite}>
            <UserPlus size={18} weight="bold" />
          </button>
        </div>
      </div>

      <motion.div layout style={{ position: 'relative', zIndex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12 }}>
        <motion.div
          initial={false}
          animate={{ height: expanded ? 24 : 0, opacity: expanded ? 1 : 0 }}
          transition={HEADER_SPRING}
          style={{ overflow: 'hidden', display: 'flex', alignItems: 'flex-end', gap: 12 }}
        >
          <AvatarChips members={trip.members} size={24} max={4} />
          <span style={{ fontSize: 4, flexShrink: 0 }}>●</span>
          <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{trip.dateRange}</span>
        </motion.div>

        <p style={{ margin: 0, fontSize: 30, fontWeight: 600 }}>{trip.name}</p>

        <motion.div layout>
          <TabPills active={tab} onChange={onNavigateTab} onPhoto />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
