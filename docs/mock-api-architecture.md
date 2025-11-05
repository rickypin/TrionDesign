# Mock API 架构文档

## 架构概述

本项目采用 **UI 与数据完全分离** 的架构，通过 API 层访问 Mock 数据，支持多场景切换。

### 技术栈

- **MSW (Mock Service Worker)** - 浏览器级 API 拦截
- **React 18** + **TypeScript** - UI 框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Recharts** - 数据可视化

### 数据流

```
UI Components (App.tsx)
    ↓ 使用
useAlertData Hook
    ↓ 调用
API Service Layer (alertApi, metricsApi, dimensionsApi)
    ↓ HTTP Request
MSW Handlers
    ↓ 读取
Scenario Data (default / networkIssue / ...)
```

---

## 目录结构

```
src/
├── types/
│   ├── alert.ts              # 告警相关类型定义
│   └── index.ts              # 通用类型定义
├── api/
│   ├── alertApi.ts           # 告警配置 API
│   ├── metricsApi.ts         # 时序指标 API
│   └── dimensionsApi.ts      # 维度数据 API
├── hooks/
│   └── useAlertData.ts       # 统一数据获取 Hook
├── mocks/
│   ├── browser.ts            # MSW 浏览器配置
│   ├── handlers/
│   │   └── index.ts          # API 请求处理器
│   └── data/
│       └── scenarios/
│           ├── index.ts              # 场景数据索引
│           ├── app-gc/               # S1: App GC 导致成功率下降
│           │   ├── alert.ts
│           │   ├── metrics.ts
│           │   └── dimensions.ts
│           ├── session-table-full/   # S2: 防火墙会话表满导致交易量下降
│           │   ├── alert.ts
│           │   ├── metrics.ts
│           │   └── dimensions.ts
│           └── pmtud-black-hole/     # S3: PMTUD Black Hole 导致响应率下降
│               ├── alert.ts
│               ├── metrics.ts
│               └── dimensions.ts
└── App.tsx                   # 主应用组件
```

---

## 核心类型定义

### AlertMetadata - 告警元数据

```typescript
interface AlertMetadata {
  spv: string;                    // SPV 标识
  component: string;              // 组件名称
  title: string;                  // 告警标题
  metricType: 'responseRate' | 'transactionCount' | 'avgResponseTime' | 'successRate';
  baseline?: BaselineConfig;      // 基线配置（可选）
  condition: {
    metric: string;               // 指标名称
    operator: '<' | '>' | '=' | '<=' | '>=';  // 支持 >= 操作符
    threshold: number;
    unit: '%' | 'ms' | 'count' | '/m' | '';   // 支持 /m（每分钟）和空字符串
  };
  duration: {
    start: string;                // 开始时间（ISO 8601 格式）
    end: string;                  // 结束时间（ISO 8601 格式）
    durationMinutes: number;      // 持续时长（分钟）
    startDate?: string;           // 开始日期（YYYY-MM-DD）
    startDateTime?: string;       // 开始日期时间（YYYY-MM-DD HH:mm）
  };
  lowestPoint: {
    value: number;
    time: string;                 // ISO 8601 格式
    unit: string;
  };
  status: AlertStatus;            // 告警状态（使用 AlertStatus 类型）
  recoveryInfo?: {                // 恢复信息（可选）
    recoveryTime: string;         // 恢复时间（ISO 8601 格式）
    recoveryValue: number;        // 恢复时的值
    recoveryDuration: number;     // 恢复耗时（分钟）
  };
  contextDescription: string;     // 上下文描述
}

// 基线配置
interface BaselineConfig {
  enabled: boolean;
  type: 'static' | 'dynamic';
  value?: number;
  period?: string;
}

// 告警状态
type AlertStatus = 'active' | 'recovered';
```

### DimensionConfig - 维度配置

```typescript
interface DimensionConfig {
  dimensions: DimensionDefinition[];  // 维度定义数组
}

// 维度定义
interface DimensionDefinition {
  id: string;                         // 维度 ID（如 'transType', 'clientIp'）
  name: string;                       // 维度显示名称
  type: 'transType' | 'serverIp' | 'clientIp' | 'channel' | 'returnCode';
  enabled: boolean;                   // 是否启用
  priority: number;                   // 优先级（数字越小优先级越高）
}
```

**说明**：
- 维度配置采用数组结构，支持多个维度的灵活配置
- 每个维度可独立启用/禁用
- 通过 `priority` 字段控制维度的展示顺序

### ScenarioStatus - 场景状态

```typescript
interface ScenarioStatus {
  networkAssessment: {
    hasImpact: boolean;
    status: HealthStatus;             // 整体健康状态
    details: {
      availability: HealthStatus;     // 可用性状态
      performance: HealthStatus;      // 性能状态
    };
  };
  businessInfraBreakdown: {
    status: HealthStatus;             // 业务基础设施状态
    primaryFactor?: string;           // 主要影响因素（可选）
  };
}

// 健康状态类型
type HealthStatus = 'healthy' | 'warning' | 'error';
```

**说明**：
- `networkAssessment.status` 表示网络整体健康状态
- `details` 中的 `availability` 和 `performance` 使用统一的 `HealthStatus` 类型
- `businessInfraBreakdown.primaryFactor` 用于标识主要影响因素（如 "网络延迟"）

---

## API 端点

### 告警配置
- `GET /api/alert/metadata` → `AlertMetadata`
- `GET /api/alert/dimensions/config` → `DimensionConfig`
- `GET /api/alert/status` → `ScenarioStatus`

### 时序指标
- `GET /api/metrics/response-rate` → `ResponseRateData[]`
- `GET /api/metrics/network-health` → `NetworkHealthData[]`
- `GET /api/metrics/tcp-health` → `TcpHealthData[]`

### 维度数据
- `GET /api/dimensions/transaction-types` → `TransTypeData[]`
- `GET /api/dimensions/clients` → `ClientData[]`
- `GET /api/dimensions/servers` → `ServerData[]`
- `GET /api/dimensions/channels` → `ChannelData[]`
- `GET /api/dimensions/return-codes` → `ReturnCodeData[]`

### 场景管理
- `POST /api/scenarios/switch` - 切换场景（通过 localStorage）
- `GET /api/scenarios/current` - 获取当前场景 ID

**实现细节**：
- 所有 API 端点由 MSW handlers 拦截（`src/mocks/handlers/index.ts`）
- 场景数据存储在 `src/mocks/data/scenarios/` 目录
- 场景切换通过 `localStorage.setItem('currentScenario', scenarioId)` 实现
- `getCurrentScenarioData()` 函数（位于 `src/mocks/data/scenarios/index.ts`）负责读取当前场景并返回对应数据

**场景切换机制**：
```typescript
// 在 src/mocks/data/scenarios/index.ts
export function getCurrentScenarioData() {
  const currentScenario = localStorage.getItem('currentScenario') || 'default';
  return scenarioRegistry[currentScenario] || scenarioRegistry.default;
}
```

---

## 添加新场景

### 步骤 1: 创建场景数据

在 `src/mocks/data/scenarios/` 创建新文件夹，例如 `highLoad/`：

```
src/mocks/data/scenarios/highLoad/
├── alert.ts
├── metrics.ts
└── dimensions.ts
```

### 步骤 2: 定义告警配置 (alert.ts)

```typescript
import type { AlertMetadata, DimensionConfig, ScenarioStatus } from '@/types/alert';

export const alertMetadata: AlertMetadata = {
  spv: 'New Credit Card System',
  component: 'Load Balancer',
  title: 'High transaction volume detected',
  metricType: 'transactionCount',
  condition: {
    metric: 'Transaction Count',
    operator: '>',
    threshold: 10000,
    unit: 'count'
  },
  duration: {
    start: '21:27',
    end: '21:32',
    durationMinutes: 6
  },
  lowestPoint: {
    value: 15200,
    time: '21:30',
    unit: 'count'
  },
  status: {
    state: 'recovered',
    recoveryTime: '21:33',
    recoveryValue: 8500
  },
  contextDescription: 'High load scenario at 21:30 (transaction count reached 15,200)'
};

export const dimensionConfig: DimensionConfig = {
  primaryDimension: 'channel',
  primaryFactor: {
    dimension: 'Channel',
    value: 'Mobile App',
    impact: 82.5,
    anomalyScore: 91.2
  }
};

export const scenarioStatus: ScenarioStatus = {
  networkAssessment: {
    hasImpact: false,
    details: {
      availability: 'normal',
      performance: 'normal'
    }
  },
  businessInfraBreakdown: {
    status: 'error'
  }
};
```

### 步骤 3: 定义时序数据 (metrics.ts)

```typescript
import type { ResponseRateData, NetworkHealthData, TcpHealthData } from '@/types';

export const responseRate: ResponseRateData[] = [
  { time: '21:20', value: 98.5, baseline: 100 },
  { time: '21:25', value: 97.2, baseline: 100 },
  // ... 更多数据点
];

export const networkHealth: NetworkHealthData[] = [
  { time: '21:20', packetLoss: 5.1, retransmission: 7.2, dupAck: 3.8 },
  // ... 更多数据点
];

export const tcpHealth: TcpHealthData[] = [
  { time: '21:20', setupSuccess: 99.8, rst: 0.2 },
  // ... 更多数据点
];
```

### 步骤 4: 定义维度数据 (dimensions.ts)

```typescript
import type { TransTypeData, ClientData, ServerData, ChannelData, ReturnCodeData } from '@/types';

export const transType: TransTypeData[] = [
  {
    type: 'Normal Purchase',    // 字段名: type（不是 name）
    cnt: 450,                   // 字段名: cnt（不是 timeouts）
    resp: 77.43,                // 响应率 (%)
    time: 245,                  // 平均响应时间 (ms)
    succ: 98.5,                 // 成功率 (%)
    impact: 85.2,               // 字段名: impact（不是 contrib）
    outlierness: 88.5           // 字段名: outlierness（不是 change）
  },
  // ... 更多数据
];

export const clients: ClientData[] = [
  {
    ip: '10.10.24.204',         // 字段名: ip（不是 name）
    cnt: 380,                   // 字段名: cnt
    resp: 75.2,                 // 响应率 (%)
    time: 258,                  // 平均响应时间 (ms)
    succ: 97.8,                 // 成功率 (%)
    impact: 72.1,               // 影响占比 (%)
    outlierness: 6.8            // 异常程度 (%)
  },
  // ... 更多数据
];

export const servers: ServerData[] = [
  {
    ip: '10.10.16.30',          // 字段名: ip（不是 name）
    cnt: 420,
    resp: 76.8,
    time: 252,
    succ: 98.2,
    impact: 79.6,
    outlierness: 9.2
  },
  // ... 更多数据
];

export const channels: ChannelData[] = [
  {
    name: 'Mobile App',         // 渠道使用 name 字段
    cnt: 520,
    resp: 74.5,
    time: 268,
    succ: 97.2,
    impact: 82.5,
    outlierness: 91.2
  },
  // ... 更多数据
];

export const returnCodes: ReturnCodeData[] = [
  {
    code: 'Timeout',            // 字段名: code（不是 name）
    cnt: 480,
    resp: 72.1,
    time: 285,
    succ: 96.5,
    impact: 88.3,
    outlierness: 95.1
  },
  // ... 更多数据
];
```

**字段名说明**：

| 字段 | 含义 | 单位 |
|------|------|------|
| `type` / `ip` / `code` / `name` | 维度标识（根据数据类型不同） | - |
| `cnt` | 交易数量 | 次 |
| `resp` | 响应率 | % |
| `time` | 平均响应时间 | ms |
| `succ` | 成功率 | % |
| `impact` | 影响占比 | % |
| `outlierness` | 异常程度 | % |

**注意**：
- 在 S2（网络问题）场景中，`ResponseRateData` 的 `value` 字段存储的是**交易数量**而非响应率
- 不同维度类型使用不同的标识字段：
  - `TransTypeData` 使用 `type`
  - `ClientData` / `ServerData` 使用 `ip`
  - `ChannelData` 使用 `name`
  - `ReturnCodeData` 使用 `code`

### 步骤 5: 注册场景

在 `src/mocks/data/scenarios/index.ts` 添加：

```typescript
import * as highLoad from './highLoad/alert';
import * as highLoadMetrics from './highLoad/metrics';
import * as highLoadDimensions from './highLoad/dimensions';

export const scenarios: Record<ScenarioId, ScenarioData> = {
  default: { /* ... */ },
  networkIssue: { /* ... */ },
  highLoad: {
    alert: highLoad.alertMetadata,
    dimensionConfig: highLoad.dimensionConfig,
    scenarioStatus: highLoad.scenarioStatus,
    metrics: {
      responseRate: highLoadMetrics.responseRate,
      networkHealth: highLoadMetrics.networkHealth,
      tcpHealth: highLoadMetrics.tcpHealth
    },
    dimensions: {
      transType: highLoadDimensions.transType,
      clients: highLoadDimensions.clients,
      servers: highLoadDimensions.servers,
      channels: highLoadDimensions.channels,
      returnCodes: highLoadDimensions.returnCodes
    }
  }
};
```

### 步骤 6: 添加场景 ID

在 `src/types/alert.ts` 添加：

```typescript
export type ScenarioId = 'default' | 'networkIssue' | 'highLoad';
```

### 步骤 7: 添加 UI 切换按钮

在 `src/App.tsx` 添加按钮：

```typescript
<button
  onClick={() => handleScenarioSwitch('highLoad')}
  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
    currentScenario === 'highLoad'
      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
  }`}
  title="High Load Scenario"
>
  <span className={currentScenario === 'highLoad' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
    S3
  </span>
</button>
```

---

## 场景切换机制

1. 用户点击场景按钮（S1, S2, S3...）
2. 调用 `switchScenario(scenarioId)` 更新 `localStorage.currentScenario`
3. 调用 `refresh()` 重新获取数据
4. MSW handlers 读取 `localStorage.currentScenario`
5. 返回对应场景的 Mock 数据
6. UI 自动更新（数据、配色、状态）

---

## UI 动态变化规则

### 告警信息
- SPV、Component、Title - 来自 `alertMetadata`
- Alert Condition - 来自 `alertMetadata.condition`
- Duration、Lowest Point、Status - 来自 `alertMetadata`
- Context Description - 来自 `alertMetadata.contextDescription`

### 网络评估
- 边框颜色 - 根据 `scenarioStatus.networkAssessment.hasImpact`
  - `hasImpact: true` → 红色边框
  - `hasImpact: false` → 绿色边框
- Availability/Performance 状态 - 来自 `scenarioStatus.networkAssessment.details`

### 业务影响 (Business Impact)
- 主因标识 - 来自 `dimensionConfig.primaryFactor`
- 维度表格数据 - 来自对应的 `dimensions.*`

### 图表数据
- Response Rate Chart - 来自 `metrics.responseRate`
- Network Health Chart - 来自 `metrics.networkHealth`
- TCP Health Chart - 来自 `metrics.tcpHealth`
- 图表参考区域 - 来自 `alertMetadata.duration`

---

## 注意事项

1. **UI 结构不变** - 只有数据和配色变化
2. **类型安全** - 所有数据必须符合 TypeScript 类型定义
3. **时间一致性** - 确保时序数据的时间点与 `alertMetadata.duration` 对齐
4. **数据完整性** - 每个场景必须包含所有必需的数据字段
5. **配色规则** - Network Assessment 和 Business Impact 的状态配色应相反（一个红一个绿）

---

## 对接真实后端

移除 MSW 并修改 API Service 层：

1. 在 `src/main.tsx` 移除或条件化 MSW 启动代码
2. 修改 `src/api/*.ts` 中的 `API_BASE` 指向真实后端
3. UI 代码无需修改

---

## 开发调试

- **查看 API 请求**: 浏览器 DevTools → Network → 筛选 `/api/`
- **修改场景数据**: 编辑 `src/mocks/data/scenarios/*/` 文件，保存后自动热更新
- **重置场景**: 清除 `localStorage.currentScenario` 或点击 S1 按钮

