import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { NETWORK_METRICS_CONFIG } from '@/config/networkMetricsConfig';
import type { MetricKey } from '@/types/networkMetrics';
import { useTooltipPosition } from '@/hooks/useTooltipPosition';

interface MetricInfoTooltipProps {
  metricKey: MetricKey;
}

export const MetricInfoTooltip: React.FC<MetricInfoTooltipProps> = ({
  metricKey,
}) => {
  const metricInfo = NETWORK_METRICS_CONFIG[metricKey];

  const {
    showTooltip: isOpen,
    position,
    triggerRef,
    tooltipRef,
    openTooltip,
    scheduleClose
  } = useTooltipPosition({
    tooltipDimensions: { width: 420, height: 300 }, // Estimated height
    gap: 8,
    useMeasuredHeight: true, // Use actual measured height
  });

  if (!metricInfo) return null;

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        scheduleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, scheduleClose]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        scheduleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, scheduleClose]);

  const toggleTooltip = () => {
    if (isOpen) {
      scheduleClose();
    } else {
      openTooltip();
    }
  };


  return (
    <>
      {/* Info Icon Button */}
      <button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        onClick={toggleTooltip}
        className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all ${
          isOpen
            ? 'text-blue-700 dark:text-blue-400 scale-110'
            : 'text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110'
        }`}
        aria-label={`View ${metricInfo.nameEn} details`}
      >
        <Info className="w-full h-full" />
      </button>
      
      {/* Tooltip Portal */}
      {isOpen && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] w-[420px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-xl transition-opacity duration-150"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            opacity: position.top === 0 ? 0 : 1,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <metricInfo.icon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {metricInfo.nameEn}
              </h4>
            </div>
            <button
              onClick={scheduleClose}
              className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content */}
          <div className="px-4 py-3 space-y-4 text-xs">
            {/* Definition */}
            <div>
              <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5 text-[11px] uppercase tracking-wide">Definition</h5>
              <p className="text-neutral-700 dark:text-neutral-300 leading-snug">
                {metricInfo.definition}
              </p>
            </div>

            {/* Impact */}
            <div>
              <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5 text-[11px] uppercase tracking-wide">Impact on Transactions</h5>
              <ul className="space-y-1">
                {metricInfo.impact.map((item, index) => (
                  <li key={index} className="text-neutral-700 dark:text-neutral-300 leading-snug">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>


          </div>
        </div>,
        document.body
      )}
    </>
  );
};

