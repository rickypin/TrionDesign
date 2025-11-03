/**
 * 格式化数字的小数位数
 * 规则：
 * - 整数位数 >= 3：不保留小数
 * - 整数位数 = 2：保留1位小数
 * - 整数位数 = 1：保留2位小数
 * - 如果小数点后数字是0，则不保留，仅保留非0的小数点后数字
 *
 * 示例：
 * - formatNumber(2536) => "2536"
 * - formatNumber(100) => "100"
 * - formatNumber(83.83) => "83.8"
 * - formatNumber(83.0) => "83"
 * - formatNumber(4.7) => "4.7"
 * - formatNumber(4.0) => "4"
 * - formatNumber(0.5) => "0.5"
 * - formatNumber(0.05) => "0.05"
 */
export function formatNumber(value: number): string {
  const absValue = Math.abs(value);
  const integerPart = Math.floor(absValue);
  const integerDigits = integerPart.toString().length;

  let formatted: string;

  if (integerDigits >= 3) {
    formatted = Math.round(value).toString();
  } else if (integerDigits === 2) {
    formatted = value.toFixed(1);
  } else {
    formatted = value.toFixed(2);
  }

  // 移除小数点后末尾的0和不必要的小数点
  // 只处理包含小数点的数字，避免影响整数部分的0
  // 例如: "83.0" => "83", "4.70" => "4.7", "100" => "100"
  if (formatted.includes('.')) {
    formatted = formatted.replace(/\.?0+$/, '');
  }

  return formatted;
}

/**
 * 格式化日期为 "Oct 29" 格式
 * @param dateString - 日期字符串，格式为 "YYYY-MM-DD"
 * @returns 格式化后的日期，如 "Oct 29"
 *
 * 示例：
 * - formatDate("2024-10-29") => "Oct 29"
 * - formatDate("2024-01-15") => "Jan 15"
 */
export function formatDate(dateString: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [year, month, day] = dateString.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const dayNumber = parseInt(day, 10);

  return `${months[monthIndex]} ${dayNumber}`;
}

