# Network Metrics - 快速参考卡片

## 📊 指标阈值速查表

| 指标 | 正常 | 警告 | 严重 | 单位 | 方向 |
|------|------|------|------|------|------|
| Packet Loss | < 1% | 1-5% | > 5% | % | 越低越好 |
| Retransmission | < 2% | 2-10% | > 10% | % | 越低越好 |
| Duplicate ACK | < 3% | 3-10% | > 10% | % | 越低越好 |
| TCP Setup Success | > 99.5% | 95-99.5% | < 95% | % | 越高越好 |
| TCP RST | < 1% | 1-5% | > 5% | % | 越低越好 |

---

## 🎨 状态颜色速查

```typescript
// 正常状态
✅ bg-green-50 dark:bg-green-900/25
   text-green-600 dark:text-green-400

// 警告状态
⚠️ bg-amber-50 dark:bg-amber-900/25
   text-amber-600 dark:text-amber-400

// 严重状态
🔴 bg-red-50 dark:bg-red-900/25
   text-red-600 dark:text-red-400
```

---

## 🔑 数据键映射

```typescript
const dataKeyToMetricKey = {
  'loss': 'packetLoss',
  'retrans': 'retransmission',
  'dupAck': 'duplicateAck',
  'setup': 'tcpSetup',
  'rst': 'tcpRst',
};
```

---

## 📐 尺寸规范

```css
/* 信息图标 */
width: 14px (3.5 × 4px)
height: 14px (3.5 × 4px)

/* 浮层卡片 */
width: 320px (桌面端)
width: 280px (平板端)
width: calc(100vw - 32px) (移动端)
max-height: 400px

/* 间距 */
gap: 8px (图标与浮层)
padding: 16px (浮层内边距)
```

---

## 🎬 动画参数

```css
/* 淡入动画 */
duration: 200ms
easing: ease-out
transform: scale(0.95) → scale(1)
opacity: 0 → 1

/* 淡出动画 */
duration: 150ms
easing: ease-in
transform: scale(1) → scale(0.95)
opacity: 1 → 0

/* 图标悬停 */
duration: 150ms
easing: ease-in-out
transform: scale(1) → scale(1.1)
```

---

## 💬 文案模板

### 状态消息模板

```typescript
// 正常
`✅ 正常 - ${metricName} ${value}${unit}（正常 ${operator}${threshold}${unit}）`

// 警告
`⚠️ 轻微影响 - ${metricName} ${value}${unit}（正常 ${operator}${threshold}${unit}）`

// 严重
`🔴 严重影响 - ${metricName} ${value}${unit}（正常 ${operator}${threshold}${unit}）`
```

### 示例

```
✅ 正常 - 丢包率 0.5%（正常 <1%）
⚠️ 轻微影响 - 重传率 5%（正常 <2%）
🔴 严重影响 - TCP RST 12%（正常 <1%）
```

---

## 🔧 常用代码片段

### 1. 计算指标状态

```typescript
import { calculateMetricStatus } from '@/utils/metricStatusCalculator';

const status = calculateMetricStatus(value, {
  warning: 1,
  critical: 5,
  reverse: false, // true for metrics where higher is better
});
```

### 2. 获取指标配置

```typescript
import { NETWORK_METRICS_CONFIG, getMetricConfigByDataKey } from '@/config/networkMetricsConfig';

// 通过 metric key 获取
const config = NETWORK_METRICS_CONFIG['packetLoss'];

// 通过 data key 获取
const config = getMetricConfigByDataKey('loss');
```

### 3. 计算平均值

```typescript
import { calculateAverageMetric } from '@/utils/metricStatusCalculator';

const avgLoss = calculateAverageMetric(
  networkHealth,
  'loss',
  alertMetadata.duration.start,
  alertMetadata.duration.end
);
```

### 4. 使用 MetricInfoTooltip

```tsx
import { MetricInfoTooltip } from '@/components/MetricInfoTooltip';

<MetricInfoTooltip
  metricKey="packetLoss"
  currentValue={2.5}
  unit="%"
/>
```

---

## 📱 响应式断点

```typescript
// Tailwind breakpoints
sm: 640px   // 平板竖屏
md: 768px   // 平板横屏
lg: 1024px  // 小型桌面
xl: 1280px  // 标准桌面
2xl: 1536px // 大型桌面

// 本功能使用的断点
mobile: < 768px
tablet: 768px - 1024px
desktop: > 1024px
```

---

## 🎯 关键交互

### 打开浮层
- 点击信息图标
- 自动计算位置（右侧优先）
- 播放淡入动画

### 关闭浮层
- 点击关闭按钮
- 点击浮层外部
- 按 ESC 键

### 定位逻辑
```
1. 优先右侧（距离图标 8px）
2. 空间不足时左侧
3. 垂直方向与图标对齐
4. 确保距离视口边缘至少 16px
```

---

## 🐛 常见问题

### Q1: 浮层位置不正确？
**A**: 检查 `getBoundingClientRect()` 是否在正确的时机调用，确保在 DOM 渲染后。

### Q2: 点击外部无法关闭？
**A**: 检查 `mousedown` 事件监听器是否正确添加，确保 ref 引用正确。

### Q3: 移动端浮层太大？
**A**: 检查响应式样式是否正确应用，确保使用 `calc(100vw - 32px)`。

### Q4: 状态计算不准确？
**A**: 检查阈值配置，注意 `reverse` 参数（TCP Setup 需要设置为 true）。

### Q5: 动画不流畅？
**A**: 检查是否使用了 `will-change` 或 `transform`，避免使用 `left/top` 动画。

---

## ✅ 检查清单

### 开发前
- [ ] 阅读设计文档
- [ ] 理解指标含义和阈值
- [ ] 准备测试数据

### 开发中
- [ ] 创建所有必需文件
- [ ] 实现核心功能
- [ ] 添加单元测试
- [ ] 测试响应式布局

### 开发后
- [ ] 功能测试（所有交互）
- [ ] 视觉测试（浅色/深色模式）
- [ ] 性能测试（无卡顿）
- [ ] 可访问性测试（键盘导航）
- [ ] 浏览器兼容性测试

---

## 📚 相关文档链接

- [详细设计文档](./network-metrics-explanation-design.md)
- [UI 原型示意](./network-metrics-ui-mockup.md)
- [实现指南](./network-metrics-implementation-guide.md)
- [设计总结](./network-metrics-explanation-summary.md)
- [设计规范](./design-token.md)

---

## 🎓 最佳实践

### 1. 内容编写
- 使用生活化比喻
- 避免专业术语堆砌
- 突出业务影响
- 提供可操作建议

### 2. 交互设计
- 保持一致性
- 提供即时反馈
- 支持多种操作方式
- 优化触摸体验

### 3. 性能优化
- 使用 `useCallback` 缓存函数
- 使用 `useMemo` 缓存计算结果
- 避免不必要的重渲染
- 使用 CSS 动画而非 JS 动画

### 4. 可访问性
- 添加 `aria-label`
- 支持键盘导航
- 提供足够的颜色对比度
- 支持屏幕阅读器

---

## 🔍 调试技巧

### 1. 定位问题
```typescript
// 在 useEffect 中打印位置信息
console.log('Icon rect:', iconRef.current?.getBoundingClientRect());
console.log('Calculated position:', position);
```

### 2. 状态问题
```typescript
// 打印状态计算结果
console.log('Metric value:', value);
console.log('Threshold:', threshold);
console.log('Calculated status:', status);
```

### 3. 性能问题
```typescript
// 使用 React DevTools Profiler
// 检查组件渲染次数和耗时
```

---

## 📞 获取帮助

遇到问题时：
1. 查看相关文档
2. 检查控制台错误
3. 使用 React DevTools 调试
4. 咨询团队成员
5. 提交 Issue

---

## 🎉 完成标志

当你看到：
- ✅ 所有指标都有信息图标
- ✅ 点击图标显示正确的解释内容
- ✅ 浮层定位合理，不超出视口
- ✅ 状态评估准确，颜色正确
- ✅ 动画流畅，无卡顿
- ✅ 响应式布局正常
- ✅ 深色模式适配完整

恭喜！功能开发完成！🎊

