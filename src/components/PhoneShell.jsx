import { useEffect, useRef } from 'react';

const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;

export default function PhoneShell({ children }) {
  const phoneRef = useRef(null);

  useEffect(() => {
    const el = phoneRef.current;
    if (!el) return undefined;

    const applyScale = () => {
      // Below the desktop-mockup breakpoint the canvas renders at 1:1 (no
      // frame, no scaling) — only correct the scale once a frame exists.
      if (window.innerWidth < 640) {
        el.style.removeProperty('--phone-scale');
        return;
      }
      // Whichever axis is actually the tighter constraint on this viewport
      // (a tall narrow window caps width, a short wide one like a laptop
      // caps height instead) — using width alone left the canvas unscaled
      // whenever height was the real limit, overflowing the clipped frame
      // and cutting off anything sticky to its bottom edge.
      const scale = Math.min(el.clientWidth / DESIGN_WIDTH, el.clientHeight / DESIGN_HEIGHT);
      el.style.setProperty('--phone-scale', String(scale));
    };

    applyScale();
    const observer = new ResizeObserver(applyScale);
    observer.observe(el);
    window.addEventListener('resize', applyScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', applyScale);
    };
  }, []);

  return (
    <div className="app-shell">
      <div className="phone" ref={phoneRef}>
        <div className="phone-canvas">{children}</div>
      </div>
      <p className="desktop-note">
        <span>For the best experience, open this on your phone and add it to your home screen as an app.</span>
        <span>Viewing on a desktop browser? Put your tab in full screen and hide the toolbar and bookmarks bar for the right sizing.</span>
      </p>
    </div>
  );
}
