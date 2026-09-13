/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

// A single in-app "push notification" slot, separate from TripContext so it
// never gets serialized into localStorage — it's purely transient, shown
// once and dismissed, not trip state to persist.
//
// `content` is kept even after dismissal (only `visible` goes false) so a
// consumer fading the banner out doesn't have its text go blank mid-transition.
const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [state, setState] = useState({ visible: false, content: null });

  const setNotification = (next) => {
    setState(next ? { visible: true, content: next } : (s) => ({ visible: false, content: s.content }));
  };

  return (
    <NotificationContext.Provider value={{ state, setNotification }}>{children}</NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used within NotificationProvider');
  return ctx.setNotification;
}

export function useActiveNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useActiveNotification must be used within NotificationProvider');
  return [ctx.state, ctx.setNotification];
}
