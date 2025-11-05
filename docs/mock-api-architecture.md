# Mock API 架构文档

> **文档用途**: 为 AI Agent 提供项目架构指南，用于后续开发和维护
> **最后更新**: 2024-11-05 | **版本**: v3.0

---

## 1. 架构概述

### 核心设计原则
- **UI 与数据完全分离**: 通过 API 层访问数据，UI 组件不直接依赖数据源
- **场景驱动**: 支持多场景切换，每个场景包含完整的告警、指标和维度数据
- **类型安全**: 完整的 TypeScript 类型定义，编译时错误检测
- **Mock 优先**: 使用 MSW 拦截 API 请求，无需后端即可开发

### 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2.0 | UI 框架 |
| TypeScript | 5.9.3 | 类型安全 |
| Vite | 5.0.0 | 构建工具 |
| MSW | 2.11.6 | API Mock |
| Tailwind CSS | 3.4.0 | 样式框架 |
| Recharts | 2.9.0 | 数据可视化 |
| Framer Motion | 11.0.0 | 动画 |
| Lucide React | 0.344.0 | 图标 |

### 数据流
```
UI (App.tsx)
  ↓ 调用
useAlertData Hook
  ↓ 调用
API Service (alertApi, metricsApi, dimensionsApi)
  ↓ fetch()
MSW Handlers (src/mocks/handlers/index.ts)
  ↓ 读取
getCurrentScenarioData() (src/mocks/data/scenarios/index.ts)
  ↓ 返回
Scenario Data (app-gc | session-table-full | pmtud-black-hole)
```

---

## 2. 目录结构

```
src/
├── types/                    # TypeScript 类型定义
│   ├── alert.ts              # 告警类型（148行）- AlertMetadata, DimensionConfig, ScenarioStatus
│   ├── index.ts              # 数据类型（107行）- ResponseRateData, TransTypeData, ClientData 等
│   └── networkMetrics.ts     # 网络指标类型
├── api/                      # API 服务层（统一数据访问接口）
│   ├── request.ts            # 通用请求工具（23行）- apiRequest<T>()
│   ├── alertApi.ts           # 告警 API（59行）- fetchAlertMetadata(), switchScenario()
│   ├── metricsApi.ts         # 指标 API（29行）- fetchResponseRate(), fetchNetworkHealth()
│   └── dimensionsApi.ts      # 维度 API（43行）- fetchTransactionTypes(), fetchClients()
├── hooks/                    # React Hooks
│   ├── useAlertData.ts       # 数据获取（165行）- 统一获取所有数据，提供 loading/error 状态
│   ├── useTheme.ts           # 主题切换
│   └── useTooltipPosition.ts # 工具提示定位
├── components/               # UI 组件（所有组件 < 500 行）
│   ├── index.tsx             # 基础组件（181行）- Card, Table
│   ├── AlertSummaryChart.tsx # 告警图表（258行）
│   ├── BusinessImpactSection.tsx # 业务影响（411行）
│   ├── NetworkCorrelationSidebar.tsx # 网络侧边栏（446行）
│   └── [其他组件]            # CustomLegend, IPTooltip, MetricInfoTooltip 等
├── config/                   # 配置文件
│   ├── chartColors.ts        # 图表颜色（17行）- CHART_COLORS 常量
│   ├── chartConfig.ts        # 图表配置
│   └── networkMetricsConfig.ts # 网络指标配置
├── utils/                    # 工具函数
│   ├── format.ts             # 格式化（62行）- formatNumber(), formatPercent()
│   ├── tableColoring.ts      # 异常检测（139行）- isOutlier(), findOutliers()
│   └── metricStatusCalculator.ts # 状态计算（80行）
├── mocks/                    # MSW Mock 数据
│   ├── browser.ts            # MSW 配置（12行）- setupWorker()
│   ├── handlers/index.ts     # 请求处理器（103行）- 拦截所有 /api/* 请求
│   └── data/scenarios/       # 场景数据
│       ├── index.ts          # 场景索引（166行）- scenarios 对象, getCurrentScenarioData()
│       ├── app-gc/           # S1: App GC 场景
│       ├── session-table-full/ # S2: 会话表满场景
│       └── pmtud-black-hole/ # S3: PMTUD 黑洞场景
├── App.tsx                   # 主应用（430行）
├── main.tsx                  # 入口（28行）- MSW 初始化
└── index.css                 # 全局样式
```

### 代码规范
- ✅ 单文件不超过 500 行
- ✅ TypeScript 严格模式
- ✅ 路径别名 `@/` 替代相对路径
- ✅ Barrel exports 模式（index.tsx）

---

## 3. 核心类型定义

> **位置**: `src/types/alert.ts` (148行), `src/types/index.ts` (107行)

### 3.1 AlertMetadata - 告警元数据

```typescript
export interface AlertMetadata {
  spv: string;                    // SPV 标识
  component: string;              // 组件名称
  title: string;                  // 告警标题
  metricType: MetricType;         // 指标类型
  baseline?: BaselineConfig;      // 基线配置（可选）
  condition: AlertCondition;      // 告警条件
  duration: AlertDuration;        // 持续时间
  lowestPoint: AlertLowestPoint;  // 最低点
  status: AlertStatus;            // 状态
  recoveryInfo?: AlertRecoveryInfo; // 恢复信息（可选）
  contextDescription?: string;    // 上下文描述（可选）
}

export type MetricType = 'responseRate' | 'transactionCount' | 'avgResponseTime' | 'successRate';
export type AlertStatus = 'active' | 'recovered' | 'acknowledged';

export interface AlertCondition {
  metric: string;                 // 指标名称
  operator: '<' | '>' | '=' | '<=' | '>=';
  threshold: number | '';         // 阈值（空字符串表示基线比较）
  unit: '%' | 'ms' | 'count' | '/m' | '' | 'Baseline';
}

export interface AlertDuration {
  start: string;                  // 开始时间（HH:mm）
  end: string;                    // 结束时间（HH:mm）
  durationMinutes: number;        // 持续时长（分钟）
  startDate?: string;             // 开始日期（YYYY-MM-DD）
  startDateTime?: string;         // 开始日期时间（YYYY-MM-DD HH:mm）
}

export interface BaselineConfig {
  type: 'static' | 'dynamic';
  value?: number;                 // 静态基线值
  data?: Array<{                  // 动态基线数据
    t: string;
    baseline: number;
    upper?: number;
    lower?: number;
  }>;
}
```

### 3.2 DimensionConfig - 维度配置

```typescript
export interface DimensionConfig {
  dimensions: DimensionDefinition[];
}

export interface DimensionDefinition {
  id: DimensionId;                // 维度 ID
  name: string;                   // 显示名称
  enabled: boolean;               // 是否启用
  dataEndpoint: string;           // API 端点
  keyField: string;               // 主键字段名
  colorColumn?: string;           // 着色列（通常是 'impact'）
}

export type DimensionId = 'transType' | 'serverIp' | 'clientIp' | 'channel' | 'returnCode';
```

**关键点**:
- `enabled: false` 的维度不会在 UI 显示
- `keyField` 用于表格行的唯一标识
- `colorColumn` 指定用于异常检测的列

### 3.3 ScenarioStatus - 场景状态

```typescript
export interface ScenarioStatus {
  networkAssessment: NetworkAssessmentStatus;
  businessInfraBreakdown: BusinessInfraBreakdownStatus;
}

export interface NetworkAssessmentStatus {
  hasImpact: boolean;             // 是否有网络影响（决定边框颜色）
  status: HealthStatus;           // 整体健康状态
  details: {
    availability: HealthStatus;   // 可用性状态
    performance: HealthStatus;    // 性能状态
  };
}

export interface BusinessInfraBreakdownStatus {
  status: HealthStatus;           // 业务状态
  primaryFactor?: {               // 主要影响因素（可选）
    dimension: DimensionId;
    value: string;
  };
}

export type HealthStatus = 'healthy' | 'error';
```

**UI 映射**:
- `hasImpact: true` → 网络卡片红色边框
- `hasImpact: false` → 网络卡片绿色边框
- `primaryFactor` → 显示 "Most Impacted" 标签

---

## 4. API 端点

> **实现**: 所有端点由 MSW 拦截（`src/mocks/handlers/index.ts`）

### 4.1 告警配置 API

**文件**: `src/api/alertApi.ts`

| 端点 | 方法 | 返回类型 | 说明 |
|------|------|----------|------|
| `/api/alert/metadata` | GET | `AlertMetadata` | 告警元数据 |
| `/api/alert/dimensions/config` | GET | `DimensionConfig` | 维度配置 |
| `/api/alert/status` | GET | `ScenarioStatus` | 场景状态 |
| `/api/scenarios/switch` | POST | `void` | 切换场景 |
| `/api/scenarios/current` | GET | `ScenarioId` | 当前场景 ID |

### 4.2 时序指标 API

**文件**: `src/api/metricsApi.ts`

| 端点 | 方法 | 返回类型 | 说明 |
|------|------|----------|------|
| `/api/metrics/response-rate` | GET | `ResponseRateData[]` | 响应率/交易量时序数据 |
| `/api/metrics/network-health` | GET | `NetworkHealthData[]` | 网络健康指标 |
| `/api/metrics/tcp-health` | GET | `TcpHealthData[]` | TCP 健康指标 |

### 4.3 维度数据 API

**文件**: `src/api/dimensionsApi.ts`

| 端点 | 方法 | 返回类型 | 说明 |
|------|------|----------|------|
| `/api/dimensions/transaction-types` | GET | `TransTypeData[]` | 交易类型 |
| `/api/dimensions/clients` | GET | `ClientData[]` | 客户端 IP |
| `/api/dimensions/servers` | GET | `ServerData[]` | 服务器 IP |
| `/api/dimensions/channels` | GET | `ChannelData[]` | 渠道 |
| `/api/dimensions/return-codes` | GET | `ReturnCodeData[]` | 返回码 |

### 4.4 场景切换机制

```typescript
// 切换场景（src/api/alertApi.ts）
export async function switchScenario(scenarioId: ScenarioId): Promise<void> {
  localStorage.setItem('currentScenario', scenarioId);
  await fetch('/api/scenarios/switch', {
    method: 'POST',
    body: JSON.stringify({ scenarioId })
  });
}

// 获取当前场景数据（src/mocks/data/scenarios/index.ts）
export function getCurrentScenarioData(): ScenarioData {
  const scenarioId = (localStorage.getItem('currentScenario') as ScenarioId) || 'app-gc';
  return scenarios[scenarioId] || scenarios['app-gc'];
}
```

**工作流程**:
1. 用户点击场景按钮 → 调用 `switchScenario(scenarioId)`
2. 更新 `localStorage.currentScenario`
3. 调用 `refresh()` 重新获取所有数据
4. MSW handlers 读取 `localStorage.currentScenario`
5. 返回对应场景的 Mock 数据

---

## 5. 数据类型定义

> **位置**: `src/types/index.ts` (107行)

### 5.1 时序数据类型

```typescript
// 响应率/交易量数据
export interface ResponseRateData {
  t: string;                      // 时间点（HH:mm）
  rate: number;                   // 响应率（%）或交易量（/m）
  baseline?: number;              // 静态基线值
  baselineUpper?: number;         // 动态基线上界
  baselineLower?: number;         // 动态基线下界
}

// 网络健康数据
export interface NetworkHealthData {
  t: string;
  loss: number;                   // 丢包率（%）
  retrans: number;                // 重传率（%）
  dupAck: number;                 // 重复 ACK 率（%）
}

// TCP 健康数据
export interface TcpHealthData {
  t: string;
  setup: number;                  // TCP 建连成功率（%）
  rst: number;                    // TCP RST 率（%）
}
```

**注意**: `ResponseRateData.rate` 字段含义根据 `metricType` 不同：
- `successRate` → 成功率（%）
- `transactionCount` → 交易量（/m）
- `responseRate` → 响应率（%）

### 5.2 维度数据类型

```typescript
// 交易类型维度
export interface TransTypeData {
  type: string;                   // 交易类型名称
  cnt: number;                    // 交易数量
  previousCnt?: number;           // 前期交易数量（基线比较）
  resp: number;                   // 响应率（%）
  time: number;                   // 平均响应时间（ms）
  succ: number;                   // 成功率（%）
  previousSucc?: number;          // 前期成功率（基线比较）
  impact: number;                 // 影响占比（%）- 用于异常检测
  outlierness: number;            // 异常程度（%）- 用于异常检测
}

// IP 维度（ClientData 和 ServerData 结构相同）
export interface ClientData {
  ip: string;                     // IP 地址
  cnt: number;
  previousCnt?: number;
  resp: number;
  time: number;
  succ: number;
  previousSucc?: number;
  impact: number;
  outlierness: number;
}

// 渠道维度
export interface ChannelData {
  channel: string;                // 渠道名称
  cnt: number;
  previousCnt?: number;
  resp: number;
  time: number;
  succ: number;
  previousSucc?: number;
  impact: number;
  outlierness?: number;           // 可选
}

// 返回码维度
export interface ReturnCodeData {
  code: number | string;          // 返回码
  cnt: number;
  previousCnt?: number;
  resp: number;
  time: number;
  succ: number;
  previousSucc?: number;
  impact: number;
  outlierness?: number;           // 可选
}
```

**字段用途**:

| 字段 | 用途 | 备注 |
|------|------|------|
| `type/ip/code/channel` | 表格主键 | 唯一标识 |
| `cnt` | 显示交易量 | 必填 |
| `previousCnt` | 基线比较 | 可选 |
| `resp` | 显示响应率 | 必填 |
| `time` | 显示响应时间 | 必填 |
| `succ` | 显示成功率 | 必填 |
| `previousSucc` | 基线比较 | 可选 |
| `impact` | 异常检测和着色 | 必填，用于 `isOutlier()` |
| `outlierness` | 异常检测和着色 | 可选，用于 `isOutlier()` |

---

## 6. 添加新场景

### 步骤 1: 创建场景目录

```bash
mkdir -p src/mocks/data/scenarios/new-scenario
touch src/mocks/data/scenarios/new-scenario/{alert,metrics,dimensions}.ts
```

### 步骤 2: 定义告警配置 (alert.ts)

**文件**: `src/mocks/data/scenarios/new-scenario/alert.ts`

```typescript
import type { AlertMetadata, DimensionConfig, ScenarioStatus } from '@/types/alert';

export const newScenarioAlertMetadata: AlertMetadata = {
  spv: 'New Credit Card System',
  component: 'Load Balancer',
  title: 'High transaction volume detected',
  metricType: 'transactionCount',
  baseline: { type: 'static', value: 5000 },
  condition: {
    metric: 'Transaction Count',
    operator: '>',
    threshold: 10000,
    unit: '/m'
  },
  duration: {
    start: '21:27',
    end: '21:32',
    durationMinutes: 6,
    startDate: '2024-10-29',
    startDateTime: '2024-10-29 21:27'
  },
  lowestPoint: { value: 15200, time: '21:30', unit: '/m' },
  status: 'recovered',
  recoveryInfo: { time: '21:33', value: 8500 }
};

export const newScenarioDimensionConfig: DimensionConfig = {
  dimensions: [
    { id: 'transType', name: 'Trans Type', enabled: true,
      dataEndpoint: '/api/dimensions/transaction-types', keyField: 'type', colorColumn: 'impact' },
    { id: 'serverIp', name: 'Server IP', enabled: true,
      dataEndpoint: '/api/dimensions/servers', keyField: 'ip', colorColumn: 'impact' },
    { id: 'clientIp', name: 'Client IP', enabled: true,
      dataEndpoint: '/api/dimensions/clients', keyField: 'ip', colorColumn: 'impact' },
    { id: 'channel', name: 'Channel', enabled: true,
      dataEndpoint: '/api/dimensions/channels', keyField: 'channel', colorColumn: 'impact' },
    { id: 'returnCode', name: 'Return Code', enabled: true,
      dataEndpoint: '/api/dimensions/return-codes', keyField: 'code', colorColumn: 'impact' }
  ]
};

export const newScenarioScenarioStatus: ScenarioStatus = {
  networkAssessment: {
    hasImpact: false,
    status: 'healthy',
    details: { availability: 'healthy', performance: 'healthy' }
  },
  businessInfraBreakdown: {
    status: 'error',
    primaryFactor: { dimension: 'channel', value: 'Mobile App' }
  }
};
```

### 步骤 3: 定义时序数据 (metrics.ts)

**文件**: `src/mocks/data/scenarios/new-scenario/metrics.ts`

```typescript
import type { ResponseRateData, NetworkHealthData, TcpHealthData } from '@/types';

export const newScenarioResponseRate: ResponseRateData[] = [
  { t: '21:21', rate: 4600 },
  { t: '21:27', rate: 4575 },  // 告警开始
  { t: '21:30', rate: 2600 },  // 最低点
  { t: '21:32', rate: 4200 },  // 告警结束
  { t: '21:33', rate: 4750 },  // 恢复
  // ... 更多数据点
];

export const newScenarioNetworkHealth: NetworkHealthData[] = [
  { t: '21:21', loss: 0.1, retrans: 0.2, dupAck: 0.1 },
  // ... 更多数据点（如果是网络问题场景，在告警时间段设置异常值）
];

export const newScenarioTcpHealth: TcpHealthData[] = [
  { t: '21:21', setup: 99.9, rst: 0.1 },
  // ... 更多数据点
];
```

**关键点**:
- 时间点必须与 `alertMetadata.duration` 对齐
- 在告警时间段（`start` 到 `end`）内设置明显的指标变化
- 网络问题场景应在网络健康数据中设置异常值

### 步骤 4: 定义维度数据 (dimensions.ts)

**文件**: `src/mocks/data/scenarios/new-scenario/dimensions.ts`

```typescript
import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';

export const newScenarioTransType: TransTypeData[] = [
  {
    type: 'Normal Purchase',
    cnt: 450, resp: 77.43, time: 245, succ: 98.5,
    impact: 85.2,      // 高影响值 - 会被标记为异常
    outlierness: 88.5  // 高异常值 - 会被标记为异常
  },
  {
    type: 'Balance Inquiry',
    cnt: 320, resp: 95.2, time: 180, succ: 99.8,
    impact: 8.5, outlierness: 2.1  // 正常值
  },
  // ... 更多数据
];

// ClientData, ServerData, ChannelData, ReturnCodeData 结构类似
export const newScenarioClients: ClientData[] = [ /* ... */ ];
export const newScenarioServers: ServerData[] = [ /* ... */ ];
export const newScenarioChannels: ChannelData[] = [ /* ... */ ];
export const newScenarioReturnCodes: ReturnCodeData[] = [ /* ... */ ];
```

**关键点**:
- 至少有一个维度项的 `impact` 和 `outlierness` 值较高（≥15%）
- 高影响项会被异常检测算法标记并显示琥珀色背景
- 如果设置了 `primaryFactor`，该项会显示 "Most Impacted" 标签

### 步骤 5: 注册场景

**文件**: `src/mocks/data/scenarios/index.ts`

```typescript
// 1. 导入新场景数据
import {
  newScenarioAlertMetadata,
  newScenarioDimensionConfig,
  newScenarioScenarioStatus
} from './new-scenario/alert';
import {
  newScenarioResponseRate,
  newScenarioNetworkHealth,
  newScenarioTcpHealth
} from './new-scenario/metrics';
import {
  newScenarioTransType,
  newScenarioClients,
  newScenarioServers,
  newScenarioChannels,
  newScenarioReturnCodes
} from './new-scenario/dimensions';

// 2. 注册到 scenarios 对象
export const scenarios: Record<ScenarioId, ScenarioData> = {
  'app-gc': { /* ... */ },
  'session-table-full': { /* ... */ },
  'pmtud-black-hole': { /* ... */ },
  'new-scenario': {
    alert: {
      metadata: newScenarioAlertMetadata,
      dimensionConfig: newScenarioDimensionConfig,
      status: newScenarioScenarioStatus
    },
    metrics: {
      responseRate: newScenarioResponseRate,
      networkHealth: newScenarioNetworkHealth,
      tcpHealth: newScenarioTcpHealth
    },
    dimensions: {
      transType: newScenarioTransType,
      clients: newScenarioClients,
      servers: newScenarioServers,
      channels: newScenarioChannels,
      returnCodes: newScenarioReturnCodes
    }
  }
};
```

### 步骤 6: 更新类型定义

**文件**: `src/types/alert.ts`

```typescript
export type ScenarioId = 'app-gc' | 'session-table-full' | 'pmtud-black-hole' | 'new-scenario';
```

### 步骤 7: 添加 UI 切换按钮

**文件**: `src/App.tsx`

在场景切换按钮区域添加新按钮（参考现有 S1, S2, S3 按钮的实现）。

---

## 7. 异常检测算法

> **位置**: `src/utils/tableColoring.ts` (139行)

### 7.1 检测逻辑

```typescript
export function isOutlier(value: number, allValues: number[]): boolean {
  // 1. 绝对阈值检查
  if (value < 15) return false;

  // 2. 计算统计指标
  const sortedValues = [...allValues].sort((a, b) => b - a);
  const secondMax = sortedValues[1] || 0;
  const mean = allValues.reduce((sum, v) => sum + v, 0) / allValues.length;
  const stdDev = Math.sqrt(
    allValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allValues.length
  );

  // 3. 相对条件（必须满足至少 2 个）
  const zScore = stdDev > 0 ? Math.abs(value - mean) / stdDev : 0;
  const isStatisticalOutlier = zScore >= 1.5;
  const isMultipleOutlier = value >= secondMax * 1.8;
  const isDominant = (value / allValues.reduce((sum, v) => sum + v, 0)) >= 0.4;

  const conditionsMet = [isStatisticalOutlier, isMultipleOutlier, isDominant].filter(Boolean).length;
  return conditionsMet >= 2;
}
```

### 7.2 应用场景

- **表格着色**: 异常项显示琥珀色背景（`bg-amber-50 dark:bg-amber-900/20`）
- **字体加粗**: 异常项使用加粗字体（`font-semibold`）
- **Most Impacted 标识**: 自动识别最受影响的维度项

### 7.3 使用方法

```typescript
import { findOutliers } from '@/utils/tableColoring';

// 查找所有异常项
const outliers = findOutliers(transType, 'impact');
// 返回: TransTypeData[] - 所有被标记为异常的项
```

---

## 8. UI 动态变化规则

### 8.1 告警信息卡片

**数据源**: `alertMetadata`

| UI 元素 | 数据字段 | 显示格式 |
|---------|----------|----------|
| SPV | `spv` | 直接显示 |
| Component | `component` | 直接显示 |
| Title | `title` | 直接显示 |
| Alert Condition | `condition` | `{metric} {operator} {threshold} {unit}` |
| Duration | `duration` | `{start} - {end} ({durationMinutes} min)` |
| Lowest Point | `lowestPoint` | `{value} {unit} at {time}` |
| Status | `status` | `active` → 红色 / `recovered` → 绿色 / `acknowledged` → 黄色 |

### 8.2 网络评估卡片

**数据源**: `scenarioStatus.networkAssessment`

| UI 元素 | 数据字段 | 映射规则 |
|---------|----------|----------|
| 边框颜色 | `hasImpact` | `true` → 红色 / `false` → 绿色 |
| 状态徽章 | `hasImpact` | `true` → "Correlated" / `false` → "Not Correlated" |
| Availability | `details.availability` | `healthy` → 绿色 "Normal" / `error` → 红色 "Abnormal" |
| Performance | `details.performance` | `healthy` → 绿色 "Normal" / `error` → 红色 "Abnormal" |

### 8.3 业务影响卡片

**数据源**: `scenarioStatus.businessInfraBreakdown`, `dimensionConfig`, `dimensions.*`

| UI 元素 | 数据字段 | 映射规则 |
|---------|----------|----------|
| 边框颜色 | `status` | `error` → 红色 / `healthy` → 绿色 |
| Most Impacted | `primaryFactor` | 显示 `{dimension}: {value}` |
| 维度表格 | `dimensionConfig.dimensions` | 仅显示 `enabled: true` 的维度 |
| 表格着色 | `colorColumn` (通常是 `impact`) | 使用 `isOutlier()` 检测异常项 |

### 8.4 图表

**数据源**: `responseRate`, `networkHealth`, `tcpHealth`, `alertMetadata`

| 图表 | 数据源 | 关键配置 |
|------|--------|----------|
| Response Rate | `responseRate` | Y 轴根据 `metricType` 动态调整 |
| Network Health | `networkHealth` | 丢包率（红）、重传率（橙）、重复 ACK（黄） |
| TCP Health | `tcpHealth` | 建连成功率（蓝）、RST 率（橙） |
| 参考区域 | `alertMetadata.duration` | 在 `start` 到 `end` 之间显示浅红色区域 |

---

## 9. 现有场景说明

### S1: app-gc (App GC 导致成功率下降)

| 属性 | 值 |
|------|-----|
| 指标类型 | `successRate` |
| 网络影响 | `hasImpact: false` (绿色边框) |
| 业务影响 | `status: 'error'` (红色边框) |
| 主要因素 | Trans Type - Normal Purchase |
| 基线类型 | 静态基线 (99.2%) |
| 适用场景 | 应用层问题（GC 暂停、内存泄漏、代码 bug） |

### S2: session-table-full (防火墙会话表满导致交易量下降)

| 属性 | 值 |
|------|-----|
| 指标类型 | `transactionCount` |
| 网络影响 | `hasImpact: true` (红色边框) |
| 业务影响 | `status: 'healthy'` (绿色边框) |
| 主要因素 | 无（所有维度均匀受影响） |
| 基线类型 | 动态基线（带上下界） |
| 适用场景 | 网络设备问题（防火墙会话表满、负载均衡器故障） |

### S3: pmtud-black-hole (PMTUD Black Hole 导致响应率下降)

| 属性 | 值 |
|------|-----|
| 指标类型 | `responseRate` |
| 网络影响 | `hasImpact: true` (红色边框) |
| 业务影响 | `status: 'error'` (红色边框) |
| 主要因素 | 待定 |
| 基线类型 | 待定 |
| 适用场景 | 网络路径问题（MTU 黑洞、路由问题） |

---

## 10. 开发注意事项

### 10.1 数据一致性

- ✅ UI 结构不变，只有数据和配色变化
- ✅ 所有数据必须符合 TypeScript 类型定义
- ✅ 时序数据的时间点必须与 `alertMetadata.duration` 对齐
- ✅ 每个场景必须包含所有必需的数据字段
- ✅ Network Assessment 和 Business Impact 的状态配色应相反

### 10.2 性能优化

- ✅ 使用 `Promise.all()` 并行获取所有数据
- ✅ 使用 `useMemo` 缓存计算结果（如 `mostImpactedItems`）
- ✅ 使用 `useCallback` 保持函数引用稳定
- ✅ 使用 `loading` 和 `error` 状态控制 UI 显示

### 10.3 代码规范

- ✅ 单文件不超过 500 行
- ✅ 使用路径别名 `@/` 替代相对路径
- ✅ 使用 `import type` 导入类型
- ✅ 使用 Barrel Exports 模式（index.tsx）

---

## 11. 对接真实后端

### 步骤 1: 配置环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_USE_REAL_API=true
```

### 步骤 2: 条件化 MSW

**文件**: `src/main.tsx`

```typescript
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development' || import.meta.env.VITE_USE_REAL_API) {
    return;  // 跳过 MSW
  }
  const { worker } = await import('./mocks/browser');
  return worker.start({ onUnhandledRequest: 'bypass' });
}
```

### 步骤 3: 更新 API 基础 URL

**文件**: `src/api/request.ts`

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
```

### 步骤 4: 验证 API 契约

确保后端 API 返回的数据结构与 TypeScript 类型定义一致（参见第 4 节 API 端点）。

### 步骤 5: 测试

UI 代码无需修改，直接测试即可。

---

## 12. 开发调试

### 12.1 查看 API 请求

```bash
# 浏览器 DevTools → Network → 筛选 /api/
# MSW 会在控制台显示拦截的请求
```

### 12.2 修改场景数据

```bash
# 编辑场景数据文件
vim src/mocks/data/scenarios/app-gc/alert.ts

# Vite 自动热更新，无需刷新浏览器
```

### 12.3 重置场景

```javascript
// 控制台执行
localStorage.removeItem('currentScenario');
// 或点击 S1 按钮切换到默认场景
```

### 12.4 调试技巧

```javascript
// 查看当前场景
localStorage.getItem('currentScenario');

// 测试异常检测
// 修改 src/mocks/data/scenarios/app-gc/dimensions.ts
// 将某个维度项的 impact 和 outlierness 值设置为 >= 15

// 测试网络影响
// 修改 src/mocks/data/scenarios/app-gc/alert.ts
// 将 networkAssessment.hasImpact 设置为 true/false
```

---

## 13. 快速参考

### 13.1 关键文件

| 文件 | 行数 | 用途 |
|------|------|------|
| `src/types/alert.ts` | 148 | 告警类型定义 |
| `src/types/index.ts` | 107 | 数据类型定义 |
| `src/api/alertApi.ts` | 59 | 告警 API |
| `src/api/metricsApi.ts` | 29 | 指标 API |
| `src/api/dimensionsApi.ts` | 43 | 维度 API |
| `src/hooks/useAlertData.ts` | 165 | 数据获取 Hook |
| `src/mocks/handlers/index.ts` | 103 | MSW 请求处理器 |
| `src/mocks/data/scenarios/index.ts` | 166 | 场景数据索引 |
| `src/utils/tableColoring.ts` | 139 | 异常检测算法 |
| `src/App.tsx` | 430 | 主应用组件 |

### 13.2 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 查看代码行数
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l
```

### 13.3 常见任务

| 任务 | 操作 |
|------|------|
| 添加新场景 | 参见第 6 节 |
| 修改场景数据 | 编辑 `src/mocks/data/scenarios/*/` |
| 调整异常检测阈值 | 修改 `src/utils/tableColoring.ts` |
| 修改图表颜色 | 修改 `src/config/chartColors.ts` |
| 对接真实后端 | 参见第 11 节 |

---

## 14. 总结

### 14.1 架构优势

| 优势 | 说明 |
|------|------|
| 完全分离 | UI 与数据完全解耦，通过 API 层通信 |
| 类型安全 | 完整的 TypeScript 类型定义，编译时错误检测 |
| 易于扩展 | 添加新场景只需创建数据文件，无需修改 UI |
| 开发友好 | MSW 提供真实的 API 体验，无需后端即可开发 |
| 生产就绪 | 移除 MSW 即可对接真实后端，UI 代码无需修改 |
| 性能优化 | 并行请求、Memoization、稳定引用 |
| 代码质量 | 单文件不超过 500 行，清晰的模块划分 |

### 14.2 关键特性

- ✅ 多场景支持（通过 localStorage 切换）
- ✅ 动态基线（支持静态和动态基线配置）
- ✅ 异常检测（基于统计算法的自动异常检测）
- ✅ 响应式设计（支持深色模式和响应式布局）
- ✅ 实时更新（Vite HMR 支持热更新）
- ✅ 类型安全（完整的 TypeScript 支持）

### 14.3 AI Agent 开发指南

**添加新场景**:
1. 创建场景目录和文件（alert.ts, metrics.ts, dimensions.ts）
2. 定义数据（参考现有场景）
3. 注册到 `scenarios` 对象
4. 更新 `ScenarioId` 类型
5. 添加 UI 切换按钮

**修改现有场景**:
1. 编辑 `src/mocks/data/scenarios/*/` 文件
2. 保存后 Vite 自动热更新

**调试技巧**:
- 使用浏览器 DevTools 查看 API 请求
- 使用 `localStorage.getItem('currentScenario')` 查看当前场景
- 修改 `impact` 和 `outlierness` 值测试异常检测

**对接真实后端**:
1. 配置环境变量（`.env`）
2. 条件化 MSW（`src/main.tsx`）
3. 验证 API 契约（参见第 4 节）

---

**文档版本**: v3.0
**最后更新**: 2024-11-05
**维护者**: TrionDesign Team
**总代码行数**: ~4,763 行（TypeScript/TSX）
