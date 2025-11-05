import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { NETWORK_METRICS_CONFIG } from '@/config/networkMetricsConfig';
import { getMetricStatusResult } from '@/utils/metricStatusCalculator';
import type { MetricKey, MetricStatusResult } from '@/types/networkMetrics';

interface MetricInfoTooltipProps {
  metricKey: MetricKey;
  currentValue?: number;
  unit?: string;
}

export const MetricInfoTooltip: React.FC<MetricInfoTooltipProps> = ({
  metricKey,
  currentValue,
  unit = '%',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const metricInfo = NETWORK_METRICS_CONFIG[metricKey];
  
  if (!metricInfo) return null;
  
  // Calculate status if current value is provided
  const statusResult: MetricStatusResult | null = currentValue !== undefined
    ? getMetricStatusResult(currentValue, metricInfo.threshold, metricInfo.nameEn, unit)
    : null;
  
  // Calculate position when opening
  useEffect(() => {
    if (isOpen && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const tooltipWidth = 480; // Increased width to avoid text wrapping
      const tooltipHeight = 500; // Estimated max height
      const gap = 12;

      let top = rect.top;
      let left = rect.right + gap;

      // Check if tooltip would overflow right edge
      if (left + tooltipWidth > viewportWidth - 16) {
        // Position to the left of icon
        left = rect.left - tooltipWidth - gap;
      }

      // Check if tooltip would overflow bottom edge
      if (top + tooltipHeight > viewportHeight - 16) {
        top = Math.max(16, viewportHeight - tooltipHeight - 16);
      }

      // Ensure minimum top padding
      if (top < 16) {
        top = 16;
      }

      setPosition({ top, left });
    }
  }, [isOpen]);
  
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/25';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/25';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/25';
      default:
        return '';
    }
  };
  
  return (
    <>
      {/* Info Icon Button */}
      <button
        ref={iconRef}
        onClick={() => setIsOpen(!isOpen)}
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
          className="fixed z-[9999] w-[480px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-xl transition-opacity duration-150"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            opacity: position.top === 0 ? 0 : 1,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">{metricInfo.icon}</span>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {metricInfo.nameEn}
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content */}
          <div className="px-4 py-3 space-y-2.5 text-xs">
            {/* Definition */}
            <div>
              <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1 text-[11px] uppercase tracking-wide">Definition</h5>
              <p className="text-neutral-700 dark:text-neutral-300 leading-snug">
                {metricInfo.definition}
              </p>
            </div>

            {/* Explanation */}
            <div>
              <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1 text-[11px] uppercase tracking-wide">Explanation</h5>
              <p className="text-neutral-700 dark:text-neutral-300 leading-snug">
                {metricInfo.explanation}
              </p>
            </div>

            {/* Impact */}
            <div>
              <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1 text-[11px] uppercase tracking-wide">Impact on Transactions</h5>
              <ul className="space-y-0.5">
                {metricInfo.impact.map((item, index) => (
                  <li key={index} className="text-neutral-700 dark:text-neutral-300 leading-snug">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Current Status */}
            {statusResult && (
              <div>
                <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1 text-[11px] uppercase tracking-wide">Current Status</h5>
                <div className={`px-3 py-1.5 rounded-md ${getStatusColor(statusResult.status)}`}>
                  <p className="font-medium leading-snug">
                    {statusResult.message}
                  </p>
                </div>
              </div>
            )}

            {/* Possible Causes or Normal Message */}
            {statusResult && statusResult.status !== 'normal' ? (
              <div>
                <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1 text-[11px] uppercase tracking-wide">Possible Causes</h5>
                <ul className="space-y-0.5">
                  {metricInfo.possibleCauses.map((cause, index) => (
                    <li key={index} className="text-neutral-700 dark:text-neutral-300 leading-snug">
                      • {cause}
                    </li>
                  ))}
                </ul>
              </div>
            ) : statusResult && metricInfo.normalMessage && (
              <div>
                <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1 text-[11px] uppercase tracking-wide">Maintaining Good Performance</h5>
                <p className="text-neutral-700 dark:text-neutral-300 leading-snug">
                  {metricInfo.normalMessage}
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

