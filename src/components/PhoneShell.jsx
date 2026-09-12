import { useEffect, useRef } from 'react';

const DESIGN_WIDTH = 390;

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
      const scale = el.clientWidth / DESIGN_WIDTH;
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
    </div>
  );
}
