# APM Alert Dashboard

现代化的应用性能监控告警仪表板，使用 TypeScript + React + Tailwind CSS 构建。

## 🏗️ 项目结构（符合 TypeScript 最佳实践）

```
TrionDesign/
├── src/
│   ├── App.tsx              # 主应用组件 (221行)
│   ├── main.tsx             # 应用入口点 (11行)
│   ├── index.css            # 全局样式
│   ├── components/          # UI 组件模块
│   │   └── index.tsx        # 可复用组件 (62行)
│   ├── data/                # 数据层
│   │   └── index.ts         # 模拟数据 (76行)
│   └── types/               # 类型定义
│       └── index.ts         # TypeScript 接口 (98行)
├── postcss.config.js        # PostCSS 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
├── tsconfig.node.json       # Node 环境 TS 配置
├── vite.config.ts           # Vite 构建配置
├── package.json             # 项目依赖
└── index.html               # HTML 入口

总计: 469 行代码 (所有源文件)
最大单文件: 221 行 ✅ (符合 500 行限制)
```

## ✨ TypeScript 最佳实践

### 1. **清晰的目录分层**
- ✅ 按功能模块组织代码（components、data、types）
- ✅ 使用 barrel exports (index.ts) 简化导入
- ✅ 所有源代码集中在 `src/` 目录

### 2. **路径别名配置**
```typescript
// 使用 @ 别名替代相对路径
import { Card, Table } from "@/components"
import { responseRate } from "@/data"
import type { CardProps } from "@/types"

// 而不是
import { Card } from "../../components"
```

配置文件：
- `tsconfig.json` - TypeScript 路径映射
- `vite.config.ts` - Vite 路径解析

### 3. **严格的类型系统**
```json
{
  "compilerOptions": {
    "strict": true,                      // 启用所有严格检查
    "noUnusedLocals": true,              // 禁止未使用的局部变量
    "noUnusedParameters": true,          // 禁止未使用的参数
    "noFallthroughCasesInSwitch": true   // switch 必须有 break
  }
}
```

### 4. **类型优先的导入**
```typescript
// 使用 type 关键字导入类型
import type { CardProps, TableProps } from "@/types"

// 区分类型和值的导入
import { Card } from "@/components"
```

### 5. **Barrel Exports 模式**
每个模块使用 `index.ts` 作为统一出口：

```typescript
// src/components/index.tsx
export { Card } from "./Card"
export { Table } from "./Table"
export { KPI } from "./KPI"

// 使用时
import { Card, Table, KPI } from "@/components"
```

### 6. **单一职责原则**
每个文件专注于单一功能：
- `types/` - 仅包含类型定义
- `data/` - 仅包含数据
- `components/` - 仅包含 UI 组件
- `App.tsx` - 应用逻辑和布局

### 7. **符合命名规范**
- ✅ 组件文件：`App.tsx`（PascalCase）
- ✅ 工具/数据：`index.ts`（camelCase）
- ✅ 类型接口：`CardProps`（PascalCase + Props 后缀）
- ✅ 目录名：`components`、`types`（小写复数）

## 🛠️ 技术栈

- **TypeScript 5.9+** - 类型安全
- **React 18** - UI 框架
- **Vite 5** - 现代构建工具
- **Tailwind CSS 3** - 实用优先的 CSS
- **Recharts** - 数据可视化
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

## 📦 安装和运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview

# TypeScript 类型检查
npx tsc --noEmit
```

## 🎯 代码质量保证

### 符合项目规则
- ✅ 单个代码文件不超过 500 行
- ✅ 最大文件仅 221 行

### TypeScript 检查
- ✅ 无类型错误
- ✅ 严格模式启用
- ✅ 未使用变量检测

### 构建验证
- ✅ 生产构建成功
- ✅ 热更新正常
- ✅ UI 功能完整

## 🎨 特性

- 📊 实时性能监控仪表板
- 📈 交互式图表（折线图、面积图）
- 🎯 多维度数据分析表格
- 🌓 深色模式支持
- ⚡ 响应式设计
- 🎭 流畅动画效果

## 📝 开发指南

### 添加新组件
```typescript
// 1. 在 src/components/ 创建组件
export const NewComponent: React.FC<Props> = (props) => {
  // ...
}

// 2. 在 src/components/index.tsx 导出
export { NewComponent } from "./NewComponent"

// 3. 使用
import { NewComponent } from "@/components"
```

### 添加新类型
```typescript
// 在 src/types/index.ts
export interface NewDataType {
  id: string;
  name: string;
}
```

### 添加新数据
```typescript
// 在 src/data/index.ts
export const newData: NewDataType[] = [
  // ...
]
```

## 🏆 最佳实践亮点

1. **模块化架构** - 清晰的关注点分离
2. **类型安全** - 完整的 TypeScript 支持
3. **可维护性** - 小文件、单一职责
4. **开发体验** - 路径别名、barrel exports
5. **代码质量** - 严格的 TS 配置
6. **性能优化** - Vite 快速构建

## 📄 许可证

Private - 内部项目

