import { useEffect } from 'react';

// The page is always white behind the app (see body background in
// global.css), so the browser's own chrome — Safari's toolbar tint, and
// whatever shows during the iOS overscroll bounce — should match that,
// not the photo header's color.
const WHITE = '#ffffff';

export default function ThemeColorSync() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', WHITE);
  }, []);

  return null;
}
