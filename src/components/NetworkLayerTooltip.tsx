import React from "react";
import { createPortal } from "react-dom";
import { useTooltipPosition } from "@/hooks/useTooltipPosition";

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

  const { showTooltip, position, triggerRef, tooltipRef, openTooltip, scheduleClose } = useTooltipPosition({
    tooltipDimensions: { width: 320, height: 100 },
    gap: 4,
  });

  return (
    <>
      <span
        ref={triggerRef as React.RefObject<HTMLSpanElement>}
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

