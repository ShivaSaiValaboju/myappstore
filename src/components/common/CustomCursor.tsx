import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const ringPosRef = useRef({ x: -100, y: -100 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if device is touch-primary without a fine mouse pointer
    const checkTouch = () => {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const hasNoHover = window.matchMedia('(hover: none)').matches;
      setIsTouchDevice(isCoarse && hasNoHover);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);

    // Add custom cursor class to html body when cursor is enabled
    if (!window.matchMedia('(pointer: coarse)').matches) {
      document.documentElement.classList.add('custom-cursor-enabled');
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setTargetPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Inspect target element for interactive states
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactiveEl = target.closest(
          'button, a, input, textarea, select, [role="button"], .cursor-pointer, [data-cursor-interactive]'
        );
        const customLabelEl = target.closest('[data-cursor-label]') as HTMLElement | null;

        if (customLabelEl) {
          setCursorText(customLabelEl.getAttribute('data-cursor-label'));
        } else {
          setCursorText(null);
        }

        setIsHovered(!!interactiveEl);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth animation loop for the trailing fluid ring
    const animateRing = () => {
      ringPosRef.current.x += (targetPos.x - ringPosRef.current.x) * 0.22;
      ringPosRef.current.y += (targetPos.y - ringPosRef.current.y) * 0.22;

      const ringEl = document.getElementById('custom-cursor-ring');
      if (ringEl) {
        ringEl.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(animateRing);
    };

    animFrameRef.current = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('resize', checkTouch);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      document.documentElement.classList.remove('custom-cursor-enabled');
    };
  }, [isVisible, targetPos.x, targetPos.y]);

  // Do not render on touch-only mobile devices to preserve native touch gestures
  if (isTouchDevice || !isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* 1. Fluid Trailing Aura Ring with Smooth Elastic Lag */}
      <div
        id="custom-cursor-ring"
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-150 ease-out flex items-center justify-center ${
          isClicking
            ? 'w-8 h-8 border-2 border-violet-400 bg-violet-500/30 scale-90'
            : isHovered
            ? 'w-12 h-12 border-2 border-violet-500/80 bg-violet-500/15 shadow-[0_0_24px_rgba(139,92,246,0.45)] backdrop-blur-[1px] scale-125'
            : 'w-9 h-9 border border-violet-500/50 bg-violet-500/5 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
        }`}
        style={{
          transform: `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0)`,
          willChange: 'transform',
        }}
      >
        {cursorText && (
          <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider px-1">
            {cursorText}
          </span>
        )}
      </div>

      {/* 2. Precision Center Dot with Instant Tracking */}
      <div
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-transform duration-75 ease-out shadow-sm ${
          isClicking
            ? 'w-2 h-2 bg-indigo-300 scale-75'
            : isHovered
            ? 'w-3 h-3 bg-violet-400 ring-2 ring-violet-300/60 scale-125'
            : 'w-2.5 h-2.5 bg-violet-600 dark:bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]'
        }`}
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          willChange: 'transform',
        }}
      />
    </div>
  );
};
