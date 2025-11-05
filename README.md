# TrionDesign - APM Alert Dashboard

> 现代化的应用性能监控告警仪表板 | Modern APM Alert Dashboard

基于 **TypeScript + React + Tailwind CSS** 构建的企业级 APM 告警分析平台，支持多场景切换、智能异常检测、网络关联分析。

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 构建生产版本
```bash
npm run build
npm run preview  # 预览构建结果
```

---

## 📋 项目概览

### 核心特性

- 🎯 **多场景支持** - 3 个预置告警场景（App GC、会话表满、PMTUD 黑洞）
- 📊 **智能异常检测** - 基于统计学的自动异常识别和高亮
- 🔗 **网络关联分析** - 网络层与业务层关联分析
- 🌓 **深色模式** - 完整的深色模式支持
- 📈 **交互式图表** - 基于 Recharts 的动态数据可视化
- 🎨 **现代化 UI** - 毛玻璃效果、流畅动画、响应式设计
- 🔄 **Mock API** - 基于 MSW 的完整 API Mock 系统

### 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **核心** | React | 18.2.0 | UI 框架 |
| | TypeScript | 5.9.3 | 类型安全 |
| | Vite | 5.0.0 | 构建工具 |
| **样式** | Tailwind CSS | 3.4.0 | 样式框架 |
| **UI 库** | Framer Motion | 11.0.0 | 动画 |
| | Lucide React | 0.344.0 | 图标 |
| | Recharts | 2.9.0 | 图表 |
| **开发** | MSW | 2.11.6 | API Mock |

---

## 📁 项目结构

```
src/
├── App.tsx                   # 主应用组件 (430行)
├── main.tsx                  # 应用入口 (28行)
├── index.css                 # 全局样式
├── components/               # UI 组件
│   ├── index.tsx             # 基础组件 (Card, Table) (181行)
│   ├── AlertSummaryChart.tsx # 告警摘要图表 (257行)
│   ├── BusinessImpactSection.tsx # 业务影响区块 (411行)
│   ├── NetworkCorrelationSidebar.tsx # 网络关联侧边栏 (446行)
│   └── [其他组件]            # 工具提示、图例等
├── types/                    # TypeScript 类型定义
│   ├── index.ts              # 通用数据类型 (107行)
│   ├── alert.ts              # 告警类型 (147行)
│   └── networkMetrics.ts     # 网络指标类型 (32行)
├── api/                      # API 服务层
│   ├── request.ts            # 通用请求工具 (23行)
│   ├── alertApi.ts           # 告警 API (59行)
│   ├── metricsApi.ts         # 指标 API (29行)
│   └── dimensionsApi.ts      # 维度 API (43行)
├── hooks/                    # React Hooks
│   ├── useAlertData.ts       # 数据获取 (164行)
│   ├── useTheme.ts           # 主题管理 (64行)
│   └── useTooltipPosition.ts # 工具提示定位 (146行)
├── config/                   # 配置文件
│   ├── chartColors.ts        # 图表颜色 (16行)
│   ├── chartConfig.ts        # 图表配置 (40行)
│   └── networkMetricsConfig.ts # 网络指标配置 (146行)
├── utils/                    # 工具函数
│   ├── format.ts             # 格式化工具 (63行)
│   ├── tableColoring.ts      # 异常检测算法 (139行)
│   ├── metricStatusCalculator.ts # 状态计算 (80行)
│   └── __tests__/            # 单元测试
└── mocks/                    # MSW Mock 数据
    ├── browser.ts            # MSW 配置 (12行)
    ├── handlers/index.ts     # 请求处理器 (103行)
    └── data/scenarios/       # 场景数据
        ├── index.ts          # 场景管理 (165行)
        ├── app-gc/           # S1: App GC 场景
        ├── session-table-full/ # S2: 会话表满场景
        └── pmtud-black-hole/ # S3: PMTUD 黑洞场景

总代码行数: ~4,763 行 (TypeScript/TSX)
最大单文件: 446 行 ✅ (符合 500 行限制)
```

### 目录职责

| 目录 | 职责 | 说明 |
|------|------|------|
| `components/` | UI 组件 | 简单组件在 `index.tsx`，复杂组件独立文件 |
| `types/` | 类型定义 | 所有 TypeScript 接口和类型 |
| `api/` | API 服务层 | 统一的数据访问接口 |
| `hooks/` | React Hooks | 自定义 Hooks（数据获取、主题、工具提示） |
| `config/` | 配置文件 | 图表、颜色、指标配置 |
| `utils/` | 工具函数 | 格式化、异常检测、状态计算 |
| `mocks/` | Mock 数据 | MSW 配置和场景数据 |

---

## 🎯 核心功能

### 1. 多场景切换

应用支持 3 个预置告警场景，可通过顶部按钮切换：

| 场景 | ID | 指标类型 | 网络影响 | 业务影响 | 说明 |
|------|-----|----------|----------|----------|------|
| **S1** | `app-gc` | 成功率 | ❌ 无 | ✅ 有 | App GC 导致成功率下降 |
| **S2** | `session-table-full` | 交易量 | ✅ 有 | ❌ 无 | 防火墙会话表满 |
| **S3** | `pmtud-black-hole` | 响应率 | ✅ 有 | ✅ 有 | PMTUD 黑洞问题 |

**切换方式**：
- UI 按钮：点击顶部 S1/S2/S3 按钮
- API 调用：`switchScenario('app-gc')`
- 存储：场景 ID 保存在 `localStorage.currentScenario`

### 2. 智能异常检测

基于统计学的异常检测算法（`src/utils/tableColoring.ts`）：

**检测规则**：
1. 绝对阈值：值 ≥ 15%
2. 相对条件（满足 2/3）：
   - Z-score ≥ 1.5（统计离群）
   - 值 ≥ 次大值 × 1.8（倍数离群）
   - 占比 ≥ 40%（主导性）

**视觉效果**：
- 异常项：琥珀色背景 `bg-amber-300 dark:bg-amber-300`
- 字体加粗：`font-semibold`
- Most Impacted 标签：自动识别主要影响因素

### 3. 网络关联分析

**Network Assessment 卡片**：
- 边框颜色：红色（有影响）/ 绿色（无影响）
- 双指标切换：Availability / Performance
- 状态徽章：Correlated / Not Correlated

**关联逻辑**：
- `hasImpact: true` → 网络层有异常，可能是根因
- `hasImpact: false` → 网络层正常，问题在应用层

---

## �️ 开发指南

### 架构设计

**数据流**：
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

**核心原则**：
- ✅ UI 与数据完全分离
- ✅ 通过 API 层访问数据
- ✅ 场景驱动的数据管理
- ✅ 完整的 TypeScript 类型安全

### 添加新场景

详细步骤请参考 `docs/mock-api-architecture.md` 第 6 节。

**快速步骤**：
1. 创建场景目录：`src/mocks/data/scenarios/new-scenario/`
2. 定义数据文件：`alert.ts`, `metrics.ts`, `dimensions.ts`
3. 注册场景：在 `src/mocks/data/scenarios/index.ts` 添加
4. 更新类型：在 `src/types/alert.ts` 添加 `ScenarioId`
5. 添加 UI 按钮：在 `src/App.tsx` 添加切换按钮

### 添加新组件

```typescript
// 1. 创建组件文件 src/components/NewComponent.tsx
export const NewComponent: React.FC<Props> = ({ ...props }) => {
  return <div>...</div>;
};

// 2. 在 src/components/index.tsx 导出
export { NewComponent } from "./NewComponent";

// 3. 使用组件
import { NewComponent } from "@/components";
```

### 路径别名

项目配置了 `@/` 别名指向 `src/` 目录：

```typescript
// ✅ 推荐
import { Card } from "@/components";
import type { AlertMetadata } from "@/types/alert";
import { formatNumber } from "@/utils/format";

// ❌ 避免
import { Card } from "../../components";
```

---

## 📚 文档资源

| 文档 | 说明 |
|------|------|
| `docs/design-token.md` | 前端开发规范（配色、组件、代码规范） |
| `docs/mock-api-architecture.md` | Mock API 架构文档（数据流、类型定义、场景管理） |
| `docs/table-coloring-logic.md` | 表格着色逻辑说明 |

---

## 🎨 代码规范

### TypeScript 严格模式

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 文件组织规则

- ✅ 单文件不超过 500 行（硬性规则）
- ✅ 使用 Barrel Exports 模式（`index.tsx`）
- ✅ 类型定义与实现分离
- ✅ 路径别名 `@/` 替代相对路径

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `AlertSummaryChart.tsx` |
| 组件名称 | PascalCase | `Card`, `Table` |
| 类型/接口 | PascalCase | `AlertMetadata`, `ResponseRateData` |
| 变量/函数 | camelCase | `responseRate`, `formatNumber` |
| 常量 | UPPER_SNAKE_CASE | `CHART_COLORS` |

---

## 🧪 测试

```bash
# 运行测试（如果配置）
npm test

# TypeScript 类型检查
npx tsc --noEmit
```

---

## 🚢 部署

### 对接真实后端

1. **配置环境变量**（`.env`）：
```env
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_USE_REAL_API=true
```

2. **条件化 MSW**（`src/main.tsx`）：
```typescript
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development' || import.meta.env.VITE_USE_REAL_API) {
    return;  // 跳过 MSW
  }
  // ...
}
```

3. **验证 API 契约**：确保后端返回的数据结构与 TypeScript 类型定义一致。

详细步骤请参考 `docs/mock-api-architecture.md` 第 11 节。

---

## 📊 项目统计

- **总代码行数**: ~4,763 行 (TypeScript/TSX)
- **最大单文件**: 446 行 (NetworkCorrelationSidebar.tsx)
- **组件数量**: 9 个主要组件
- **场景数量**: 3 个预置场景
- **API 端点**: 10 个 Mock 端点

---

## 🏆 最佳实践

1. **模块化架构** - 清晰的关注点分离
2. **类型安全** - 完整的 TypeScript 支持
3. **可维护性** - 小文件、单一职责
4. **开发体验** - 路径别名、Barrel Exports、HMR
5. **代码质量** - 严格的 TS 配置、单元测试
6. **性能优化** - Memoization、并行请求、稳定引用

---

## 📄 许可证

Private - 内部项目

---

## 🤝 贡献

本项目遵循以下开发规范：
- 单个代码文件不超过 500 行
- 前端设计开发遵循 `docs/design-token.md`
- 扩展场景参考 `docs/mock-api-architecture.md`

---

**最后更新**: 2025-11-05 | **版本**: v2.0

