/**
 * Calculate outlierness percentage for a dataset
 * Outlierness represents how much higher a value's failure rate is compared to the median
 * 
 * @param data - Array of data items with resp (response/failure rate) field
 * @param respField - The field name containing the failure rate (default: 'resp')
 * @returns Array of data items with outlierness field added
 */
export function calculateOutlierness<T extends Record<string, any>>(
  data: T[],
  respField: keyof T = 'resp' as keyof T
): (T & { outlierness: number })[] {
  if (data.length === 0) {
    return [];
  }

  // Extract failure rates and sort them to find median
  const failureRates = data.map(item => Number(item[respField])).sort((a, b) => a - b);
  
  // Calculate median
  const median = failureRates.length % 2 === 0
    ? (failureRates[failureRates.length / 2 - 1] + failureRates[failureRates.length / 2]) / 2
    : failureRates[Math.floor(failureRates.length / 2)];

  // Calculate outlierness for each item
  return data.map(item => {
    const failureRate = Number(item[respField]);
    
    // Outlierness = ((failureRate - median) / median) * 100
    // If median is 0, outlierness is 0 (to avoid division by zero)
    const outlierness = median === 0 
      ? 0 
      : Math.max(0, ((failureRate - median) / median) * 100);

    return {
      ...item,
      outlierness: Math.round(outlierness) // Round to integer
    };
  });
}

