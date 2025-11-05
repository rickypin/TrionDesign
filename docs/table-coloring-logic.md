# Table 着色逻辑

> **AI Agent 专用文档** - 用于 Business Impact 表格的离群值检测与高亮

## 核心实现

**文件位置**：`src/utils/tableColoring.ts`
**应用范围**：Trans Type、Return Code、Server IP、Client IP 表格
**着色字段**：`impact`（百分比值）

## 算法逻辑

### 1. 离群值检测 `isOutlier(value, allValues)`

**条件**：必须同时满足
- **绝对阈值**：`value >= 15`
- **相对条件**：满足以下 3 个条件中的至少 2 个
  - Z-score ≥ 1.5：`Math.abs(value - mean) / stdDev >= 1.5`
  - 倍数检测：`value >= secondMax * 1.8`
  - 占比检测：`(value / total) * 100 >= 40`

**返回**：`boolean`

### 2. 加粗检测 `shouldBold(value, allValues)`

**条件**：必须同时满足
- `value >= 20`
- Z-score ≥ 1.5

**返回**：`boolean`

### 3. 样式生成 `getRowColorClass(value, allValues)`

**返回**：
- 离群值：`'bg-amber-300 dark:bg-amber-300 text-neutral-900 dark:text-neutral-900'`
- 非离群值：`''`

## 使用方式

### Table 组件集成

<augment_code_snippet path="src/components/index.tsx" mode="EXCERPT">
````typescript
// 提取所有值用于离群检测
const allValues = colorColumn
  ? sortedData.map(row => row[colorColumn]).filter(v => typeof v === 'number')
  : [];

// 应用样式
<tr className={`${getRowColorClass(row[colorColumn], allValues)} ${shouldBold(row[colorColumn], allValues) ? 'font-semibold' : 'font-normal'}`}>
````
</augment_code_snippet>

### BusinessImpactSection 使用

<augment_code_snippet path="src/components/BusinessImpactSection.tsx" mode="EXCERPT">
````typescript
<Table
  keyField="type"
  colorColumn="impact"  // 指定着色列
  defaultSortColumn="impact"
  data={transType}
  columns={[...]}
/>
````
</augment_code_snippet>

## 关键特性

1. **表格隔离**：每个表格独立计算，基于自身数据分布
2. **防止误导**：绝对阈值 15% 避免小值着色
3. **统计严谨**：Z-score 检测统计学显著性
4. **样式统一**：所有离群值使用相同的亮黄色高亮
5. **深色模式**：`bg-amber-300` 在深浅模式下保持一致

## 调优参数

**位置**：`src/utils/tableColoring.ts`

```typescript
const ABSOLUTE_THRESHOLD = 15;  // 离群值最小值
const BOLD_THRESHOLD = 20;      // 加粗最小值
const Z_SCORE_THRESHOLD = 1.5;  // 统计学离群
const MULTIPLE_THRESHOLD = 1.8; // 倍数检测
const DOMINANT_THRESHOLD = 40;  // 占比检测（%）
```

## 典型场景

| 场景 | 数据分布 | 着色结果 |
|------|---------|---------|
| **集中分布** | 92.8%, 4.8%, 1.4% | 仅 92.8% 高亮 + 加粗 |
| **均匀分布** | 35%, 24.5%, 22%, 10%, 8.5% | 前 3 个高亮 + 加粗 |
| **双峰分布** | 51.2%, 48.8% | 两个都高亮 + 加粗 |
| **低影响** | 5%, 3%, 2% | 全部不着色（< 15%） |

## 辅助函数

**`findOutliers<T>(data, valueField)`**
从数据集中筛选出所有离群值项

**`analyzeOutliers(values)`**
返回每个值的离群分析结果：`{ value, isOutlier, shouldBold }[]`
