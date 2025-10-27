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

