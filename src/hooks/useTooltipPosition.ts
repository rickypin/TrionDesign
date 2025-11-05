/**
 * useTooltipPosition Hook
 * Provides unified tooltip positioning logic with viewport boundary detection
 */

import { useState, useRef, useEffect, useCallback } from 'react';

interface TooltipDimensions {
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
}

interface UseTooltipPositionOptions {
  tooltipDimensions: TooltipDimensions;
  gap?: number;
  useMeasuredHeight?: boolean; // If true, use actual tooltip height instead of estimated
}

interface UseTooltipPositionReturn {
  showTooltip: boolean;
  position: TooltipPosition;
  triggerRef: React.RefObject<HTMLElement>;
  tooltipRef: React.RefObject<HTMLDivElement>;
  openTooltip: () => void;
  scheduleClose: () => void;
}

/**
 * Custom hook for tooltip positioning with viewport boundary detection
 * @param options - Configuration options for tooltip dimensions and gap
 * @returns Tooltip state and control functions
 */
export function useTooltipPosition(options: UseTooltipPositionOptions): UseTooltipPositionReturn {
  const { tooltipDimensions, gap = 4, useMeasuredHeight = false } = options;

  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const hideTimer = useRef<number | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let tooltipWidth = tooltipDimensions.width;
    let tooltipHeight = tooltipDimensions.height;

    // Use measured height if requested and tooltip is rendered
    if (useMeasuredHeight && tooltipRef.current) {
      tooltipHeight = tooltipRef.current.offsetHeight;
    }

    let top = rect.bottom + gap;
    let left = rect.left;

    // Horizontal positioning with boundary detection
    if (left + tooltipWidth > viewportWidth - 16) {
      // Align to right edge or viewport edge
      left = Math.max(16, viewportWidth - tooltipWidth - 16);
    }

    // Ensure minimum left padding
    if (left < 16) {
      left = 16;
    }

    // Vertical positioning - prefer below, but check if space available
    const spaceBelow = viewportHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;

    if (spaceBelow >= tooltipHeight + gap) {
      // Enough space below
      top = rect.bottom + gap;
    } else if (spaceAbove >= tooltipHeight + gap) {
      // Not enough space below but enough above
      top = rect.top - tooltipHeight - gap;
    } else {
      // Not enough space in either direction - choose the side with more space
      if (spaceBelow >= spaceAbove) {
        top = Math.max(rect.bottom + gap, viewportHeight - tooltipHeight - 16);
      } else {
        top = rect.top - tooltipHeight - gap;
        if (top < 16) {
          top = 16;
        }
      }
    }

    setPosition({ top, left });
  }, [tooltipDimensions, gap, useMeasuredHeight]);

  // Recalculate position when tooltip becomes visible (for measured height mode)
  useEffect(() => {
    if (showTooltip && useMeasuredHeight) {
      requestAnimationFrame(() => {
        requestAnimationFrame(calculatePosition);
      });
    }
  }, [showTooltip, useMeasuredHeight, calculatePosition]);

  const openTooltip = useCallback(() => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    setShowTooltip(true);

    if (!useMeasuredHeight) {
      calculatePosition();
    }
  }, [useMeasuredHeight, calculatePosition]);

  const scheduleClose = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowTooltip(false), 150);
  }, []);

  return {
    showTooltip,
    position,
    triggerRef,
    tooltipRef,
    openTooltip,
    scheduleClose,
  };
}

