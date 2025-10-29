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
│           ├── index.ts      # 场景数据索引
│           ├── default/      # 场景 1：默认场景
│           │   ├── alert.ts
│           │   ├── metrics.ts
│           │   └── dimensions.ts
│           └── networkIssue/ # 场景 2：网络故障
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
  condition: {
    metric: string;               // 指标名称
    operator: '<' | '>' | '=' | '<=';
    threshold: number;
    unit: '%' | 'ms' | 'count';
  };
  duration: {
    start: string;                // 开始时间
    end: string;                  // 结束时间
    durationMinutes: number;
  };
  lowestPoint: {
    value: number;
    time: string;
    unit: string;
  };
  status: {
    state: 'active' | 'recovered';
    recoveryTime?: string;
    recoveryValue?: number;
  };
  contextDescription: string;     // 上下文描述
}
```

### DimensionConfig - 维度配置

```typescript
interface DimensionConfig {
  primaryDimension: 'transType' | 'serverIp' | 'clientIp' | 'channel' | 'returnCode';
  primaryFactor: {
    dimension: string;
    value: string;
    impact: number;               // 影响占比 (%)
    anomalyScore: number;         // 异常程度 (%)
  };
}
```

### ScenarioStatus - 场景状态

```typescript
interface ScenarioStatus {
  networkAssessment: {
    hasImpact: boolean;
    details: {
      availability: 'normal' | 'error';
      performance: 'normal' | 'error';
    };
  };
  businessInfraBreakdown: {
    status: 'healthy' | 'error';
  };
}
```

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
  { name: 'Normal Purchase', timeouts: 450, contrib: 85.2, change: 88.5 },
  // ... 更多数据
];

export const clients: ClientData[] = [
  { name: '10.10.24.204', timeouts: 380, contrib: 72.1, change: 6.8 },
  // ... 更多数据
];

export const servers: ServerData[] = [
  { name: '10.10.16.30', timeouts: 420, contrib: 79.6, change: 9.2 },
  // ... 更多数据
];

export const channels: ChannelData[] = [
  { name: 'Mobile App', timeouts: 520, contrib: 82.5, change: 91.2 },
  // ... 更多数据
];

export const returnCodes: ReturnCodeData[] = [
  { name: 'Timeout', timeouts: 480, contrib: 88.3, change: 95.1 },
  // ... 更多数据
];
```

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

