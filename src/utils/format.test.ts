import { formatNumber } from './format';

/**
 * 测试格式化函数
 * 运行方式：在浏览器控制台中复制粘贴此文件内容
 */

// 测试用例
const testCases = [
  // 整数位数 >= 3：不保留小数
  { input: 2536, expected: '2536', description: '整数位4位，不保留小数' },
  { input: 100, expected: '100', description: '整数位3位，不保留小数' },
  { input: 100.5, expected: '101', description: '整数位3位，四舍五入' },
  { input: 999.9, expected: '1000', description: '整数位3位，四舍五入进位' },
  
  // 整数位数 = 2：保留1位小数，但去除末尾0
  { input: 83.83, expected: '83.8', description: '整数位2位，保留1位小数' },
  { input: 83.0, expected: '83', description: '整数位2位，小数为0则不保留' },
  { input: 84.45, expected: '84.5', description: '整数位2位，保留1位小数（四舍五入）' },
  { input: 29.07, expected: '29.1', description: '整数位2位，保留1位小数（四舍五入）' },
  { input: 51.33, expected: '51.3', description: '整数位2位，保留1位小数' },
  { input: 10.0, expected: '10', description: '整数位2位，小数为0则不保留' },
  { input: 99.0, expected: '99', description: '整数位2位，小数为0则不保留' },
  
  // 整数位数 = 1：保留2位小数，但去除末尾0
  { input: 4.7, expected: '4.7', description: '整数位1位，保留1位非0小数' },
  { input: 4.0, expected: '4', description: '整数位1位，小数为0则不保留' },
  { input: 0.5, expected: '0.5', description: '整数位1位，保留1位非0小数' },
  { input: 0.05, expected: '0.05', description: '整数位1位，保留2位小数' },
  { input: 3.47, expected: '3.47', description: '整数位1位，保留2位小数' },
  { input: 0.0, expected: '0', description: '整数位1位，小数为0则不保留' },
  { input: 9.99, expected: '9.99', description: '整数位1位，保留2位小数' },
  { input: 1.10, expected: '1.1', description: '整数位1位，去除末尾0' },
  { input: 2.00, expected: '2', description: '整数位1位，小数为0则不保留' },
];

// 运行测试
console.log('=== 格式化函数测试 ===\n');
let passCount = 0;
let failCount = 0;

testCases.forEach(({ input, expected, description }) => {
  const result = formatNumber(input);
  const passed = result === expected;
  
  if (passed) {
    passCount++;
    console.log(`✅ PASS: ${description}`);
    console.log(`   输入: ${input}, 期望: ${expected}, 结果: ${result}\n`);
  } else {
    failCount++;
    console.log(`❌ FAIL: ${description}`);
    console.log(`   输入: ${input}, 期望: ${expected}, 实际: ${result}\n`);
  }
});

console.log(`\n=== 测试结果 ===`);
console.log(`通过: ${passCount}/${testCases.length}`);
console.log(`失败: ${failCount}/${testCases.length}`);
console.log(`成功率: ${((passCount / testCases.length) * 100).toFixed(1)}%`);

