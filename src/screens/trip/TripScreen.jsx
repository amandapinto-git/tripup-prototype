import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../../state/TripContext';
import TripHeroHeader from '../../components/TripHeroHeader';
import { HEADER_SPRING } from '../../utils/motion';
import InviteModal from '../../components/InviteModal';
import OverviewBody from './OverviewBody';
import ItineraryBody from './ItineraryBody';
import ExpensesBody from './ExpensesBody';

export default function TripScreen() {
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const tab = params.get('tab') || 'overview';

  if (!trip) {
    return (
      <div className="phone-scroll" style={{ padding: 24 }}>
        <p>Trip not found.</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Back home
        </button>
      </div>
    );
  }

  const setTab = (next) => setParams({ tab: next }, { replace: true });

  return (
    <div className="phone-fixed" style={{ background: '#fff' }}>
      <TripHeroHeader
        trip={trip}
        tab={tab}
        onNavigateTab={setTab}
        onBack={() => navigate('/')}
        onInvite={() => setInviteOpen(true)}
      />

      <motion.div
        layout
        transition={HEADER_SPRING}
        className="scroll-body-outer"
        style={{
          background: '#fff',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="scroll-body">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {tab === 'overview' && <OverviewBody trip={trip} />}
              {tab === 'itinerary' && <ItineraryBody trip={trip} />}
              {tab === 'expenses' && <ExpensesBody trip={trip} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {inviteOpen && <InviteModal trip={trip} onClose={() => setInviteOpen(false)} />}
    </div>
  );
}
