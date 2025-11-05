/**
 * Table coloring utilities for outlier detection
 *
 * This module provides functions to detect outliers in data based on statistical analysis.
 * Used for highlighting impacted items in tables and determining "Most Impacted" items.
 */

// Outlier detection configuration constants
const OUTLIER_CONFIG = {
  ABSOLUTE_THRESHOLD: 15,      // Minimum value (%) to be considered for outlier detection
  BOLD_THRESHOLD: 20,          // Minimum value (%) to apply bold styling
  Z_SCORE_THRESHOLD: 1.5,      // Z-score threshold for statistical outlier detection
  MULTIPLE_THRESHOLD: 1.8,     // Multiple of second highest value
  DOMINANCE_THRESHOLD: 40,     // Percentage of total to be considered dominant
  MIN_CONDITIONS_MET: 2,       // Minimum relative conditions to meet
} as const;

export interface OutlierItem {
  value: number;
  isOutlier: boolean;
  shouldBold: boolean;
}

/**
 * Detect if a value is an outlier based on statistical analysis
 * 
 * Outlier detection logic:
 * 1. Absolute threshold: value must be >= 15%
 * 2. Relative conditions (must meet at least 2 of 3):
 *    - Z-score >= 1.5 (statistical outlier)
 *    - Value is 1.8x or more than the second highest
 *    - Value accounts for 40% or more of total
 * 
 * @param value - The value to check
 * @param allValues - All values in the dataset
 * @returns Whether the value is an outlier
 */
export function isOutlier(value: number, allValues: number[]): boolean {
  if (allValues.length <= 1 || Math.min(...allValues) === Math.max(...allValues)) {
    return false;
  }

  // 1. Absolute threshold check
  if (value < OUTLIER_CONFIG.ABSOLUTE_THRESHOLD) {
    return false;
  }

  // Calculate statistical metrics
  const sortedValues = [...allValues].sort((a, b) => b - a);
  const secondMax = sortedValues[1] || 0;
  const mean = allValues.reduce((sum, v) => sum + v, 0) / allValues.length;
  const variance = allValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allValues.length;
  const stdDev = Math.sqrt(variance);

  // 2. Relative conditions
  // 2a. Z-score detection
  const zScore = stdDev > 0 ? Math.abs(value - mean) / stdDev : 0;
  const isStatisticalOutlier = zScore >= OUTLIER_CONFIG.Z_SCORE_THRESHOLD;

  // 2b. Multiple detection
  const isMultipleOutlier = secondMax > 0 && value >= secondMax * OUTLIER_CONFIG.MULTIPLE_THRESHOLD;

  // 2c. Dominance detection
  const total = allValues.reduce((sum, v) => sum + v, 0);
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const isDominant = percentage >= OUTLIER_CONFIG.DOMINANCE_THRESHOLD;

  // Must meet at least 2 relative conditions
  const relativeConditionsMet = [isStatisticalOutlier, isMultipleOutlier, isDominant].filter(Boolean).length >= OUTLIER_CONFIG.MIN_CONDITIONS_MET;

  return relativeConditionsMet;
}

/**
 * Detect if a value should be bolded (stronger outlier)
 * 
 * Bold conditions:
 * 1. Absolute value >= 20%
 * 2. Z-score >= 1.5 (statistically significant outlier)
 * 
 * @param value - The value to check
 * @param allValues - All values in the dataset
 * @returns Whether the value should be bolded
 */
export function shouldBold(value: number, allValues: number[]): boolean {
  if (allValues.length <= 1 || Math.min(...allValues) === Math.max(...allValues)) {
    return false;
  }

  const mean = allValues.reduce((sum, v) => sum + v, 0) / allValues.length;
  const variance = allValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allValues.length;
  const stdDev = Math.sqrt(variance);
  const zScore = stdDev > 0 ? Math.abs(value - mean) / stdDev : 0;

  return value >= OUTLIER_CONFIG.BOLD_THRESHOLD && zScore >= OUTLIER_CONFIG.Z_SCORE_THRESHOLD;
}

/**
 * Analyze all values and return outlier information for each
 * 
 * @param values - Array of values to analyze
 * @returns Array of outlier information for each value
 */
export function analyzeOutliers(values: number[]): OutlierItem[] {
  return values.map(value => ({
    value,
    isOutlier: isOutlier(value, values),
    shouldBold: shouldBold(value, values),
  }));
}

/**
 * Find all outlier items from a dataset
 * 
 * @param data - Array of data items
 * @param valueField - Field name containing the value to check
 * @returns Array of items that are outliers
 */
export function findOutliers<T extends Record<string, any>>(
  data: T[],
  valueField: keyof T = 'impact' as keyof T
): T[] {
  const values = data.map(item => Number(item[valueField])).filter(v => typeof v === 'number');
  
  return data.filter(item => {
    const value = Number(item[valueField]);
    return isOutlier(value, values);
  });
}

/**
 * Get the CSS class for table row coloring based on outlier detection
 * 
 * @param value - The value to check
 * @param allValues - All values in the dataset
 * @returns CSS class string for the row
 */
export function getRowColorClass(value: number, allValues: number[]): string {
  if (!isOutlier(value, allValues)) {
    return '';
  }
  
  // Unified bright yellow highlight for all outliers
  return 'bg-amber-300 dark:bg-amber-300 text-neutral-900 dark:text-neutral-900';
}

