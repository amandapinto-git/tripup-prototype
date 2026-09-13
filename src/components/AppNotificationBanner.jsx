import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveNotification } from '../state/NotificationContext';
import NotificationBanner from './NotificationBanner';

// Renders whatever's currently sitting in NotificationContext — mounted
// once at the app root so it survives the navigation that typically
// follows the action that triggered it (e.g. submitting a new poll).
export default function AppNotificationBanner() {
  const [{ visible, content }, setNotification] = useActiveNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => setNotification(null), 7000);
    return () => clearTimeout(timer);
  }, [visible, setNotification]);

  return (
    <NotificationBanner
      visible={visible}
      title={content?.title || ''}
      subtitle={content?.subtitle || ''}
      onDismiss={() => setNotification(null)}
      onTap={() => {
        const to = content?.to;
        setNotification(null);
        if (to) navigate(to);
      }}
    />
  );
}
