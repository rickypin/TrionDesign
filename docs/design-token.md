# TrionDesign 前端开发规范

> **AI Agent 专用文档** - 清晰、简洁、可执行的开发规范

## 项目定位

应用性能监控仪表板（APM Dashboard），设计理念：**Modern, Minimal & Clear**

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| **核心** | React | 18.2.0 |
| | TypeScript | 5.9.3 |
| | Vite | 5.0.0 |
| **样式** | Tailwind CSS | 3.4.0 |
| **UI库** | Framer Motion | 11.0.0 |
| | Lucide React | 0.344.0 |
| | Recharts | 2.9.0 |
| **开发** | MSW | 2.11.6 |

---

## 配色系统

### 核心原则
- 所有颜色必须提供 `dark:` 变体
- Dark 模式使用 `neutral-900` 背景（非 `neutral-950`）
- 卡片背景比页面背景更亮，形成层次

### 配色表

#### 背景色
```typescript
// 页面背景
bg-neutral-50 dark:bg-neutral-900

// 卡片背景（毛玻璃效果）
bg-white/70 dark:bg-neutral-800/90 backdrop-blur

// 头部背景
bg-white/70 dark:bg-neutral-800/80 backdrop-blur

// 次级背景
bg-neutral-100 dark:bg-neutral-700

// 三级背景
bg-neutral-100 dark:bg-neutral-600
```

#### 文字色
```typescript
// 主文字
text-neutral-900 dark:text-neutral-100

// 次要文字
text-neutral-500

// 反色文字（用于深色按钮）
text-white dark:text-neutral-900
```

#### 强调色
```typescript
// 警告/高亮（琥珀色）
bg-amber-300 dark:bg-amber-300
text-neutral-900 dark:text-neutral-900

// 错误（红色）
bg-red-100 dark:bg-red-900/50
text-red-600 dark:text-red-300

// 成功（绿色）
bg-green-100 dark:bg-green-900/50
text-green-600 dark:text-green-300

// 信息（蓝色）
bg-blue-100 dark:bg-blue-900/50
text-blue-600 dark:text-blue-300
```

#### 边框色
```typescript
// 主边框
border-neutral-200/70 dark:border-neutral-600/50

// 次级边框
border-neutral-200/70 dark:border-neutral-700

// 表格边框
border-neutral-100 dark:border-neutral-600

// 聚焦边框
ring-1 ring-black/5
```

---

## 组件系统

### 组件分类

**基础组件**（定义在 `src/components/index.tsx`）：
- `Card` - 卡片容器
- `Table` - 数据表格（支持排序、着色）

**复杂组件**（独立文件）：
- `AlertSummaryChart` - 告警摘要图表
- `BusinessImpactSection` - 业务影响区块
- `NetworkCorrelationSidebar` - 网络关联侧边栏
- `MetricInfoTooltip` - 指标信息提示
- `CustomLegendWithInfo` - 自定义图例
- `IPTooltip` - IP 地址工具提示
- 其他辅助组件

### 核心组件规范

#### Card 组件
```tsx
// 用法
<Card className={className}>{children}</Card>

// 样式
className="rounded-xl bg-white/70 dark:bg-neutral-800/90 backdrop-blur shadow-sm ring-1 ring-black/5"
```

#### Table 组件
```tsx
// 用法
<Table
  keyField="id"
  columns={[
    { key: 'name', title: '名称' },
    { key: 'value', title: '数值', render: (v) => `${v}%` }
  ]}
  data={dataArray}
  colorColumn="value"  // 可选，指定着色列
  defaultSortColumn="value"  // 可选
  defaultSortDirection="desc"  // 可选
/>

// 特性
- 点击表头排序
- 基于统计学的智能着色（离群值检测）
- 离群值高亮：bg-amber-300 dark:bg-amber-300 text-neutral-900
```

#### AlertSummaryChart 组件
```tsx
// 用法
<AlertSummaryChart
  responseRate={responseRateData}
  alertMetadata={alertMetadata}
  chartConfig={chartConfig}
  resolvedTheme={theme}
/>

// 特性
- 动态 Y 轴配置
- 参考线和参考区域
- 告警时间点标注
```

#### BusinessImpactSection 组件
```tsx
// 用法
<BusinessImpactSection
  mostImpactedItems={mostImpactedItems}
  transType={transType}
  returnCodes={returnCodes}
  channels={channels}
  servers={servers}
  clients={clients}
  dimensionConfig={dimensionConfig}
  successRateColumnConfig={successRateColumnConfig}
/>

// 特性
- 展示最受影响的维度项
- 多维度数据表格
- IP 地址工具提示
```

#### NetworkCorrelationSidebar 组件
```tsx
// 用法
<NetworkCorrelationSidebar
  networkHealth={networkHealthData}
  tcpHealth={tcpHealthData}
  alertMetadata={alertMetadata}
  hasImpact={hasNetworkImpact}
  details={networkDetails}
  resolvedTheme={theme}
  formatNumber={formatNumber}
  CHART_COLORS={chartColors}
  getReferenceAreaColor={getReferenceAreaColor}
  getReferenceLineColor={getReferenceLineColor}
/>

// 特性
- 固定宽度侧边栏（xl: 280px）
- 默认显示摘要，可展开详情
- 双指标切换（Availability/Performance）
- 状态徽章（Normal/Impacted）
```

---

## 项目结构

```
src/
├── App.tsx              # 主应用（430行）
├── main.tsx             # 入口（28行）
├── index.css            # 全局样式
├── components/          # UI 组件
│   ├── index.tsx        # 基础组件（181行）
│   ├── AlertSummaryChart.tsx        # 告警图表（257行）
│   ├── BusinessImpactSection.tsx    # 业务影响（411行）
│   ├── NetworkCorrelationSidebar.tsx # 网络侧边栏（446行）
│   └── [其他组件]       # 工具提示、图例等
├── types/               # 类型定义
│   ├── index.ts         # 通用类型（107行）
│   ├── alert.ts         # 告警类型（147行）
│   └── networkMetrics.ts # 网络指标类型（32行）
├── api/                 # API 层
│   ├── alertApi.ts      # 告警 API
│   ├── metricsApi.ts    # 指标 API
│   ├── dimensionsApi.ts # 维度 API
│   └── request.ts       # 请求工具
├── hooks/               # 自定义 Hooks
│   ├── useAlertData.ts  # 数据获取（164行）
│   ├── useTheme.ts      # 主题管理（64行）
│   └── useTooltipPosition.ts # 工具提示定位（146行）
├── config/              # 配置
│   ├── chartColors.ts   # 图表颜色（16行）
│   ├── chartConfig.ts   # 图表配置（40行）
│   └── networkMetricsConfig.ts # 网络指标配置（146行）
├── utils/               # 工具函数
│   ├── format.ts        # 格式化（63行）
│   ├── tableColoring.ts # 表格着色（139行）
│   └── metricStatusCalculator.ts # 状态计算（80行）
└── mocks/               # MSW Mock
    ├── browser.ts       # MSW 配置
    ├── handlers/index.ts # 请求处理器（103行）
    └── data/scenarios/  # 场景数据
        ├── index.ts     # 场景管理（165行）
        ├── app-gc/      # S1: App GC
        ├── session-table-full/ # S2: 会话表满
        └── pmtud-black-hole/   # S3: PMTUD 黑洞
```

### 目录职责

| 目录 | 职责 |
|------|------|
| `components/` | UI 组件。简单组件在 `index.tsx`，复杂组件独立文件 |
| `types/` | TypeScript 类型定义 |
| `api/` | API 服务层（基于 MSW mock） |
| `hooks/` | 自定义 React Hooks |
| `config/` | 配置文件（图表、颜色、指标） |
| `utils/` | 工具函数（格式化、计算、着色） |
| `mocks/` | MSW 配置和模拟数据 |

### 组件组织原则

- **简单组件**（< 50 行）→ `components/index.tsx`
- **复杂组件**（≥ 50 行或有业务逻辑）→ 独立文件
- **单文件不超过 500 行**（硬性规则）

---

## 代码规范

### 文件组织
- **单文件不超过 500 行**（硬性规则）
- 组件、类型、数据严格分离
- 使用路径别名 `@/` 引用 `src/`

### TypeScript 规范

**严格模式**（tsconfig.json）：
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

**类型定义要求**：
- 所有组件 Props 必须定义接口
- 数据模型必须定义接口
- 组件使用 `React.FC<Props>` 或 `React.ReactElement`
- 泛型组件使用 `<T extends Record<string, any>>`

**示例**：
```typescript
// 组件 Props
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-xl bg-white/70 dark:bg-neutral-800/90 ${className}`}>
    {children}
  </div>
);

// 泛型组件
export const Table = <T extends Record<string, any>>({
  columns,
  data,
  keyField
}: TableProps<T>): React.ReactElement => (
  // ...
);
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `Card.tsx` |
| 组件名称 | PascalCase | `Card`, `Table` |
| 类型/接口 | PascalCase | `CardProps`, `ResponseRateData` |
| 变量/函数 | camelCase | `responseRate`, `formatNumber` |
| 路径别名 | `@/` | `@/components`, `@/types` |

### 样式规范

**Tailwind CSS 原则**：
- 优先使用 Tailwind 工具类
- 所有颜色必须提供 `dark:` 变体
- 避免自定义 CSS
- 使用模板字符串动态拼接类名

**常用样式模式**：
```typescript
// 卡片容器
className="rounded-xl bg-white/70 dark:bg-neutral-800/90 backdrop-blur shadow-sm ring-1 ring-black/5"

// 毛玻璃背景
className="backdrop-blur bg-white/70 dark:bg-neutral-800/80"

// 主按钮
className="rounded-xl px-3 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"

// 次按钮
className="rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-700"
```

---

## 图表规范

### Recharts 配置

**图表类型**：
- `LineChart` - 折线图（趋势数据）
- `AreaChart` - 面积图（多维度对比）

**配置文件**：
- `src/config/chartConfig.ts` - 图表配置函数
- `src/config/chartColors.ts` - 颜色常量
- `src/config/networkMetricsConfig.ts` - 网络指标元数据

**使用示例**：
```tsx
import { getCartesianGridConfig, getTooltipContentStyle } from '@/config/chartConfig';

<ResponsiveContainer width="100%" height="100%">
  <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
    <CartesianGrid {...getCartesianGridConfig(resolvedTheme)} />
    <XAxis dataKey="t" />
    <YAxis />
    <Tooltip contentStyle={getTooltipContentStyle(resolvedTheme)} />
    <Legend />
  </LineChart>
</ResponsiveContainer>
```

**图表颜色**（`CHART_COLORS`）：
```typescript
{
  blue: '#3b82f6',
  purple: '#a855f7',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  pink: '#ec4899',
  indigo: '#6366f1',
  packetLoss: '#ef4444',
  retransmission: '#f97316',
  duplicateAck: '#eab308',
  tcpSetupSuccess: '#60a5fa',
  tcpRst: '#fb923c',
}
```

---

## 工具函数

### 格式化工具（`src/utils/format.ts`）

**`formatNumber(value: number): string`**
- 智能格式化小数位数
- 规则：整数位 ≥3 不保留小数，=2 保留1位，=1 保留2位

**`formatDate(dateString: string): string`**
- 格式化日期为 "Oct 29" 格式

### 表格着色（`src/utils/tableColoring.ts`）

**`isOutlier(value: number, allValues: number[]): boolean`**
- 基于统计学检测离群值
- 绝对阈值：≥15%
- 相对条件：Z-score、倍数、占比（满足2/3）

**`getRowColorClass(value: number, allValues: number[]): string`**
- 返回：`bg-amber-300 dark:bg-amber-300 text-neutral-900` 或空

**`findOutliers<T>(data: T[], key: keyof T): T[]`**
- 找出数据中的离群值项

### 指标状态计算（`src/utils/metricStatusCalculator.ts`）

**`calculateMetricStatus(value: number, threshold: MetricThreshold): MetricStatus`**
- 计算指标状态（normal/warning/critical）
- 支持正向和反向指标

---

## 构建配置

### Vite 配置（vite.config.ts）

```typescript
{
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    warmup: { clientFiles: ['./src/App.tsx', './src/main.tsx'] }
  },
  optimizeDeps: {
    include: ['recharts', 'framer-motion']
  }
}
```

### 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

---

## 最佳实践

### 性能优化
- 图表数据使用 `useMemo` 缓存
- 避免内联函数作为 Props

### 可访问性
- 使用语义化 HTML 标签
- 表格使用 `<table>` 结构
- 按钮使用 `<button>` 而非 `<div>`

### 响应式设计
- 使用 Tailwind 断点（`md:`, `lg:`, `xl:`）
- 容器使用 `w-full`
- 表格添加 `overflow-x-auto`

### 深色模式
- 所有颜色必须提供 `dark:` 变体
- 测试两种模式的对比度
- 避免硬编码颜色值

---

## 开发工作流

### 新增组件
1. 在 `src/components/` 创建组件文件
2. 在 `src/types/` 定义 Props 类型
3. 在 `src/components/index.tsx` 导出
4. 在页面中引入使用

### 新增 API
1. 在 `src/api/` 创建 API 文件
2. 在 `src/types/` 定义数据类型
3. 在 `src/mocks/handlers/` 添加 mock 处理器
4. 在组件中调用 API

---

## 参考资源

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

---

**文档版本**：v2.0
**最后更新**：2025-11-05
**适用对象**：AI Agent 开发维护

