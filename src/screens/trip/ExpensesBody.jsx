import { useLocation, useNavigate } from 'react-router-dom';
import { UsersThree, User, Plus, ArrowsLeftRight, Check } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Avatar from '../../components/Avatar';
import CategoryIcon from '../../components/CategoryIcon';
import { totalsByCategory, yourShareByCategory, computePairwiseBalances, formatMoney } from '../../utils/balances';
import { CATEGORY_META, YOU_ID } from '../../data/seed';
import { useTripDispatch } from '../../state/TripContext';

function memberById(members, id) {
  return members.find((m) => m.id === id);
}

function timeAgo(dateStr, anchorStr) {
  const anchor = anchorStr ? new Date(`${anchorStr}T23:59:59Z`) : new Date();
  const days = Math.floor((anchor - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default function ExpensesBody({ trip }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useTripDispatch();
  const [scope, setScope] = useState('group');
  const [justSettled, setJustSettled] = useState(null);
  // Captured once from router state (set by AddExpenseFlow on submit) so it
  // survives even though the flow's own screen has already unmounted.
  const [toast, setToast] = useState(location.state?.toast || null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const scopedExpenses =
    scope === 'group' ? trip.expenses : trip.expenses.filter((e) => e.paidBy === YOU_ID || e.splitWith?.includes(YOU_ID));

  const { totals, total } =
    scope === 'group'
      ? totalsByCategory(scopedExpenses.filter((e) => !e.isSettlement))
      : yourShareByCategory(trip.expenses, trip.members, YOU_ID);
  const { youOwe, owedToYou } = computePairwiseBalances(trip.expenses, trip.members, YOU_ID);

  const transactions = [...scopedExpenses]
    .filter((e) => !e.isSettlement)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSettle = (memberId, amount) => {
    dispatch({ type: 'SETTLE', tripId: trip.id, memberId, you: YOU_ID, amount });
    setJustSettled(memberId);
    setTimeout(() => setJustSettled(null), 2000);
  };

  return (
    <>
      <div style={{ padding: '36px 24px 24px', display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="row-between" style={{ alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)' }}>
                {scope === 'group' ? 'Total Spend' : 'Your Spend'}
              </p>
              <p style={{ margin: 0, fontSize: 48, fontWeight: 600, color: '#000' }}>{formatMoney(total)}</p>
            </div>
            <div style={{ display: 'flex', gap: 6, padding: 4, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 999 }}>
              <button
                className="icon-btn"
                style={{ background: scope === 'group' ? '#000' : 'transparent', color: scope === 'group' ? '#fff' : 'var(--ink-mute)' }}
                onClick={() => setScope('group')}
                title="Group expenses"
              >
                <UsersThree size={18} weight="regular" />
              </button>
              <button
                className="icon-btn"
                style={{ background: scope === 'me' ? '#000' : 'transparent', color: scope === 'me' ? '#fff' : 'var(--ink-mute)' }}
                onClick={() => setScope('me')}
                title="Just me"
              >
                <User size={18} weight="regular" />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <div
                key={key}
                style={{
                  minWidth: 0,
                  background: 'rgba(0,0,0,0.04)',
                  borderRadius: 16,
                  padding: '12px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CategoryIcon category={key} size={16} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    color: 'rgba(0,0,0,0.55)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {meta.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#000', whiteSpace: 'nowrap' }}>
                  {formatMoney(totals[key] || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {youOwe.length > 0 && (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#000' }}>You owe</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {youOwe.map((s, i) => {
                const member = memberById(trip.members, s.to);
                return (
                  <div key={s.to}>
                    {i > 0 && <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }} />}
                    <div className="row-between" style={{ padding: '12px 0' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Avatar member={member} size={32} />
                        <span style={{ fontWeight: 500, fontSize: 15, color: '#000' }}>{member?.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#000' }}>{formatMoney(s.amount)}</span>
                        {justSettled === s.to ? (
                          <span className="toast">Settled!</span>
                        ) : (
                          <button className="btn-dark-sm" onClick={() => handleSettle(s.to, s.amount)}>
                            Settle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {owedToYou.length > 0 && (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#000' }}>Owed to you</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {owedToYou.map((s, i) => {
                const member = memberById(trip.members, s.from);
                return (
                  <div key={s.from}>
                    {i > 0 && <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }} />}
                    <div className="row-between" style={{ padding: '12px 0' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Avatar member={member} size={32} />
                        <span style={{ fontWeight: 500, fontSize: 15, color: '#000' }}>{member?.name}</span>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 15, color: '#000' }}>{formatMoney(s.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {youOwe.length === 0 && owedToYou.length === 0 && (
          <div className="card-muted" style={{ textAlign: 'center', color: 'var(--ink-mute)', fontSize: 14 }}>
            You're all settled up.
          </div>
        )}

        <div>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#000' }}>All Transactions</p>
            <button
              style={{
                margin: 0,
                padding: 0,
                border: 'none',
                background: 'transparent',
                fontSize: 13,
                color: 'rgba(0,0,0,0.45)',
                fontWeight: 500,
              }}
            >
              See All
            </button>
          </div>
          {transactions.length === 0 && (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-mute)' }}>No expenses here yet.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.slice(0, 8).map((exp, i) => {
              const payer = memberById(trip.members, exp.paidBy);
              return (
                <div key={exp.id}>
                  {i > 0 && <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }} />}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0' }}>
                    <Avatar member={payer} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: '#000' }}>
                        <strong style={{ fontWeight: 600 }}>{payer?.id === 'you' ? 'You' : payer?.name}</strong> paid for{' '}
                        {exp.description}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 400, color: 'rgba(0,0,0,0.38)' }}>
                        {timeAgo(exp.date, trip.currentDate)}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#000', flexShrink: 0 }}>{formatMoney(exp.amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className="btn btn-outline"
          style={{ flex: 1 }}
          onClick={() => youOwe.forEach((s) => handleSettle(s.to, s.amount))}
          disabled={youOwe.length === 0}
        >
          <ArrowsLeftRight size={14} weight="bold" /> Settle all
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/trip/${trip.id}/add-expense`)}>
          <Plus size={14} weight="bold" /> Add an expense
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 'calc(max(16px, env(safe-area-inset-bottom, 0px) + 8px) + 66px)',
              zIndex: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 999,
              background: '#e6f4ea',
              color: '#1e7a34',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
          >
            <Check size={14} weight="bold" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
