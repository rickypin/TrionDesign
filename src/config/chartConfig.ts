/**
 * Chart Configuration
 * Provides unified configuration for Recharts components
 */

/**
 * Get CartesianGrid configuration based on theme
 */
export const getCartesianGridConfig = (theme: string) => ({
  strokeDasharray: "3 3",
  stroke: theme === 'dark' ? '#525252' : '#e5e5e5',
  strokeOpacity: 0.5,
});

/**
 * Get Tooltip content style based on theme
 */
export const getTooltipContentStyle = (theme: string) => ({
  backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
  border: `1px solid ${theme === 'dark' ? '#404040' : '#e5e5e5'}`,
  borderRadius: '8px',
  color: theme === 'dark' ? '#fafafa' : '#171717',
});

/**
 * Get XAxis configuration
 */
export const getXAxisConfig = (theme: string) => ({
  stroke: theme === 'dark' ? '#737373' : '#a3a3a3',
  tick: { fill: theme === 'dark' ? '#a3a3a3' : '#737373' },
});

/**
 * Get YAxis configuration
 */
export const getYAxisConfig = (theme: string) => ({
  stroke: theme === 'dark' ? '#737373' : '#a3a3a3',
  tick: { fill: theme === 'dark' ? '#a3a3a3' : '#737373' },
});

