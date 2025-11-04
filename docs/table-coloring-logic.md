# Table 着色逻辑文档

## 概述

Business Impact 中的所有表格（Trans Type、Return Code、Server IP、Client IP）使用**统一的离群值检测算法**进行着色，每个表格独立计算，不跨表格比较。

## 核心设计原则

1. **表格隔离**：每个表格独立计算着色，基于自身数据分布
2. **离群值检测**：识别统计学上显著的异常值
3. **双重门槛**：同时满足绝对阈值和相对条件
4. **分级着色**：根据离群程度使用不同颜色深度
5. **样式统一**：所有表格使用完全一致的着色样式

## 着色算法

### 离群值着色（唯一着色方式）

#### 步骤 1: 绝对阈值检查

```typescript
const ABSOLUTE_THRESHOLD = 15; // impact >= 15%
if (value < ABSOLUTE_THRESHOLD) {
  return ''; // 不着色
}
```

**目的**：防止"相对大但绝对小"的场景
- ❌ 场景：所有 impact 都在 5% 以下，最大值 5% 虽然相对最大，但绝对值太小
- ✅ 只有 impact >= 15% 的值才考虑着色

#### 步骤 2: 相对条件检测（需满足任意 2 个）

##### 2a. 统计学离群检测（Z-score）

```typescript
const zScore = Math.abs(value - mean) / stdDev;
const isStatisticalOutlier = zScore >= 1.5;
```

- 计算值距离均值的标准差倍数
- Z-score >= 1.5 表示显著偏离正态分布

**示例**：
- S1 场景 Trans Type: Normal Purchase 92.8%, 其他 < 5%
  - mean ≈ 20%, stdDev ≈ 40%
  - Z-score ≈ 1.8 ✅

##### 2b. 倍数检测

```typescript
const isMultipleOutlier = value >= secondMax * 1.8;
```

- 最大值是第二大值的 1.8 倍以上
- 识别"一枝独秀"的场景

**示例**：
- S1: Normal Purchase 92.8% vs Pre-auth 4.8%
  - 92.8 / 4.8 ≈ 19.3 ✅

##### 2c. 占比检测

```typescript
const percentage = (value / total) * 100;
const isDominant = percentage >= 40;
```

- 单个值占总和的 40% 以上
- 识别主导因素

**示例**：
- S1: Normal Purchase 92.8% / 总和 ≈ 93% ✅

#### 步骤 3: 统一亮黄色高亮

满足绝对阈值 + 任意 2 个相对条件后，使用统一的亮黄色高亮：

**配色方案**：
- **背景色**：`bg-amber-300`（亮黄色，深浅模式一致）
- **文字色**：`text-neutral-900`（黑色，高对比度）
- **字体**：根据 impact 值决定是否加粗（见下方）

**设计理由**：
- 在深色模式下清晰可见
- 所有离群值使用一致的视觉样式
- 高对比度确保可读性

## 字体加粗逻辑

独立于背景色，加粗条件：

```typescript
const BOLD_THRESHOLD = 20;
return value >= BOLD_THRESHOLD && zScore >= 1.5;
```

**显著离群值**：
- 绝对值 >= 20%
- Z-score >= 1.5

## 场景示例

### 场景 S1: App GC（集中分布）

**Trans Type 表格**：

| Trans Type | Impact | 着色结果 |
|------------|--------|----------|
| Normal Purchase | 92.8% | 亮黄色 + 加粗 |
| Pre-authorization | 4.8% | 不着色（< 15%） |
| Cash Advance | 1.4% | 不着色（< 15%） |
| 其他 | < 1% | 不着色（< 15%） |

**分析**：

- Normal Purchase: 绝对值 92.8% ✅，Z-score 高 ✅，倍数 19x ✅，占比 93% ✅ → 亮黄色高亮
- 其他值：绝对值 < 15% ❌，直接不着色

### 场景 S2: Network Issue（均匀分布）

**Trans Type 表格**：

| Trans Type | Impact | 着色结果 |
|------------|--------|----------|
| Normal Purchase | 35.0% | 亮黄色 + 加粗 |
| Pre-authorization | 24.5% | 亮黄色 + 加粗 |
| Cash Advance | 22.0% | 亮黄色 + 加粗 |
| Pre-auth Completion | 10.0% | 不着色（< 15%） |
| Merchandise Return | 8.5% | 不着色（< 15%） |

**分析**：

- Normal Purchase 35%: 绝对值 ✅，可能满足 2 个相对条件 → 亮黄色高亮
- Pre-authorization 24.5%: 绝对值 ✅，可能满足 2 个相对条件 → 亮黄色高亮
- Cash Advance 22.0%: 绝对值 ✅，可能满足 2 个相对条件 → 亮黄色高亮

**Server IP 表格**：

| Server IP | Impact | 着色结果 |
|-----------|--------|----------|
| 10.10.16.30 | 51.2% | 亮黄色 + 加粗 |
| 10.10.16.31 | 48.8% | 亮黄色 + 加粗 |

**分析**：

- 两个 IP 都满足绝对阈值（> 15%）
- 差异很小（2.4%），但都是高值（> 30%）
- 都会被着色为亮黄色

### 场景 S3: Placeholder（低影响）

**Trans Type 表格**：

| Trans Type | Impact | 着色结果 |
|------------|--------|----------|
| Normal Purchase | 64.6% | 亮黄色 + 加粗 |
| Pre-authorization | 17.6% | 可能亮黄色 |
| Cash Advance | 12.2% | 不着色（< 15%） |
| 其他 | < 5% | 不着色（< 15%） |

## 优势

1. **样式统一**：所有表格使用完全一致的着色逻辑和样式
2. **智能适配**：自动适应不同数据分布
3. **避免误导**：绝对阈值防止小值着色
4. **统计严谨**：基于 Z-score 的科学方法
5. **视觉清晰**：分级着色传达离群程度
6. **表格独立**：每个表格独立计算，不受其他表格影响

## 调优参数

可根据实际需求调整的参数：

```typescript
// 绝对阈值
const ABSOLUTE_THRESHOLD = 15;  // impact 最小值（低于此值不着色）
const BOLD_THRESHOLD = 20;      // 加粗最小值

// 相对条件阈值
const Z_SCORE_THRESHOLD = 1.5;  // 统计学离群
const MULTIPLE_THRESHOLD = 1.8; // 倍数检测
const DOMINANT_THRESHOLD = 40;  // 占比检测（%）

// 配色方案
const HIGHLIGHT_COLOR = 'bg-amber-300 dark:bg-amber-300';  // 亮黄色（深浅模式一致）
const TEXT_COLOR = 'text-neutral-900 dark:text-neutral-900';  // 黑色文字（高对比度）
```
