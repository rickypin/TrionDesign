import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface NetworkLayerTooltipProps {
  children: React.ReactNode;
  serverIps: string[];
  componentName: string;
}

export const NetworkLayerTooltip: React.FC<NetworkLayerTooltipProps> = ({ children, serverIps, componentName }) => {
  // Format IPs for display (comma-separated)
  const ipsText = serverIps.join(',');
  // Format display text: "ComponentName (IP1,IP2)"
  const displayText = `${componentName} (${ipsText})`;
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const hideTimer = useRef<number | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const openTooltip = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Estimated tooltip dimensions
      const tooltipWidth = 320;
      const tooltipHeight = 100;
      const gap = 4; // Smaller gap for closer positioning

      let top = rect.bottom + gap;
      let left = rect.left;

      // Horizontal positioning with boundary detection
      if (left + tooltipWidth > viewportWidth - 16) {
        // Align to right edge of trigger element
        left = rect.right - tooltipWidth;
      }

      // Ensure minimum left padding
      if (left < 16) {
        left = 16;
      }

      // Vertical positioning - prefer below, but check if space available
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < tooltipHeight + gap + 16 && spaceAbove > spaceBelow) {
        // Not enough space below and more space above - position above
        top = rect.top - tooltipHeight - gap;
      } else {
        // Default: position below
        top = rect.bottom + gap;
      }

      // Final boundary check
      if (top < 16) {
        top = 16;
      } else if (top + tooltipHeight > viewportHeight - 16) {
        top = viewportHeight - tooltipHeight - 16;
      }

      setPosition({ top, left });
    }
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShowTooltip(true);
  };

  const scheduleClose = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowTooltip(false), 150);
  };

  return (
    <>
      <span
        ref={spanRef}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer underline underline-offset-2"
        onMouseEnter={openTooltip}
        onMouseLeave={scheduleClose}
      >
        {children}
      </span>
      {showTooltip && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-2.5 rounded-lg shadow-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxWidth: '320px'
          }}
          onMouseEnter={openTooltip}
          onMouseLeave={scheduleClose}
        >
          <div className="text-sm space-y-1.5">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors group">
              <div className="h-4 w-4 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 rounded text-white text-[10px] font-bold flex-shrink-0">
                N
              </div>
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs">
                Track {displayText} in Netis NPM
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors group">
              <div className="h-4 w-4 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 rounded text-white text-[10px] font-bold flex-shrink-0">
                42
              </div>
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs">
                Track {displayText} in Netis 42
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

