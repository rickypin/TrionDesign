import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { NETWORK_METRICS_CONFIG } from '@/config/networkMetricsConfig';
import type { MetricKey } from '@/types/networkMetrics';

interface MetricInfoTooltipProps {
  metricKey: MetricKey;
}

export const MetricInfoTooltip: React.FC<MetricInfoTooltipProps> = ({
  metricKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const metricInfo = NETWORK_METRICS_CONFIG[metricKey];

  if (!metricInfo) return null;
  
  // Calculate position when opening
  useEffect(() => {
    if (isOpen && iconRef.current) {
      const calculatePosition = () => {
        if (!iconRef.current || !tooltipRef.current) return;

        const rect = iconRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const tooltipWidth = 420;
        const gap = 8;

        // Get actual tooltip height after render
        const tooltipHeight = tooltipRef.current.offsetHeight;

        let top: number;
        let left = rect.left;

        // Check if tooltip would overflow right edge
        if (left + tooltipWidth > viewportWidth - 16) {
          // Align to the right edge instead
          left = Math.max(16, viewportWidth - tooltipWidth - 16);
        }

        // Determine vertical position
        const spaceBelow = viewportHeight - rect.bottom - 16;
        const spaceAbove = rect.top - 16;

        // Check if tooltip fits below
        if (spaceBelow >= tooltipHeight + gap) {
          // Enough space below - position below the icon
          top = rect.bottom + gap;
        } else if (spaceAbove >= tooltipHeight + gap) {
          // Not enough space below but enough above - position above the icon
          top = rect.top - tooltipHeight - gap;
        } else {
          // Not enough space in either direction - choose the side with more space
          if (spaceBelow >= spaceAbove) {
            // More space below - position below but adjust to fit
            top = Math.max(rect.bottom + gap, viewportHeight - tooltipHeight - 16);
          } else {
            // More space above - position above the icon
            top = rect.top - tooltipHeight - gap;
            // Ensure it doesn't go above viewport
            if (top < 16) {
              top = 16;
            }
          }
        }

        setPosition({ top, left });
      };

      // Calculate position after a short delay to ensure tooltip is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(calculatePosition);
      });
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
              onClick={() => setIsOpen(false)}
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

