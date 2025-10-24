# TrionDesign 前端开发规范文档

## 📋 项目概述

这是一个现代化的应用性能监控仪表板（Application Performance Monitoring Dashboard），采用 **Modern, Minimal & Clear** 的设计理念，为用户提供简洁、高效的数据可视化体验。

---

## 🛠️ 技术栈

### 核心框架
- **React** `18.2.0` - 前端 UI 框架
- **TypeScript** `5.9.3` - 类型安全的 JavaScript 超集
- **Vite** `5.0.0` - 新一代前端构建工具

### 样式方案
- **Tailwind CSS** `3.4.0` - 实用优先的 CSS 框架
- **PostCSS** `8.4.0` - CSS 转换工具
- **Autoprefixer** `10.4.0` - 自动添加浏览器前缀

### UI 增强库
- **Framer Motion** `11.0.0` - 强大的动画库
- **Lucide React** `0.344.0` - 优雅的图标库
- **Recharts** `2.9.0` - 数据可视化图表库

### 开发工具
- **@vitejs/plugin-react** - Vite 的 React 插件
- **@types/react** & **@types/react-dom** - React 类型定义
- **@types/node** - Node.js 类型定义

---

## 🎨 UI 设计规范

### 设计原则
遵循 **Modern, Minimal & Clear** 三大原则：

1. **Modern（现代）** - 采用最新的设计趋势和技术
2. **Minimal（简约）** - 去除冗余，聚焦核心功能
3. **Clear（清晰）** - 信息层次分明，易于理解

### 视觉风格

#### 1. 布局特点
- **卡片式布局**：所有内容模块使用 `Card` 组件封装
- **圆角设计**：统一使用 `rounded-2xl`（16px）和 `rounded-xl`（12px）
- **间距系统**：主容器间距使用 `space-y-6`（24px）
- **内边距**：卡片内容使用 `p-4`（16px）
- **响应式网格**：使用 `grid-cols-1 md:grid-cols-4` 等响应式布局

#### 2. 毛玻璃效果（Glassmorphism）
- **卡片背景**：`bg-white/70 dark:bg-neutral-900/70 backdrop-blur`
- **顶部栏**：`bg-white/70 dark:bg-neutral-900/60 backdrop-blur`
- **应用场景**：主要卡片、导航栏、浮动元素

#### 3. 阴影与边框
- **阴影**：`shadow-sm` 搭配 `ring-1 ring-black/5`
- **分割线**：`border-neutral-200/70 dark:border-neutral-800/70`
- **透明度**：适度使用透明度（/70, /60）增强层次感

---

## 🎨 配色规范

### 主题系统
项目支持**浅色模式**和**深色模式**切换，通过 Tailwind 的 `dark:` 变体实现。

### 配色方案

#### 1. 背景色（Background）
| 用途 | 浅色模式 | 深色模式 | Tailwind 类 |
|------|---------|---------|------------|
| 页面背景 | `#FAFAFA` | `#0A0A0A` | `bg-neutral-50 dark:bg-neutral-950` |
| 卡片背景 | `rgba(255,255,255,0.7)` | `rgba(23,23,23,0.7)` | `bg-white/70 dark:bg-neutral-900/70` |
| 头部背景 | `rgba(255,255,255,0.7)` | `rgba(23,23,23,0.6)` | `bg-white/70 dark:bg-neutral-900/60` |
| 次级背景 | `#F5F5F5` | `#262626` | `bg-neutral-100 dark:bg-neutral-800` |

#### 2. 文字色（Text）
| 用途 | 浅色模式 | 深色模式 | Tailwind 类 |
|------|---------|---------|------------|
| 主文字 | `#171717` | `#FAFAFA` | `text-neutral-900 dark:text-neutral-100` |
| 次要文字 | `#737373` | `#737373` | `text-neutral-500` |
| 反色文字 | `#FFFFFF` | `#171717` | `text-white dark:text-neutral-900` |

#### 3. 强调色（Accent）
| 颜色 | 用途 | 示例类 |
|------|------|-------|
| **Amber（琥珀色）** | 警告、告警状态 | `bg-amber-100 dark:bg-amber-900/40`<br>`text-amber-600` |
| **Red（红色）** | 错误、严重告警 | 用于图表标记区域 |
| **Neutral Dark** | 主按钮 | `bg-neutral-900 dark:bg-white` |

#### 4. 边框色（Border）
| 用途 | 浅色模式 | 深色模式 | Tailwind 类 |
|------|---------|---------|------------|
| 主边框 | `rgba(229,229,229,0.7)` | `rgba(38,38,38,0.7)` | `border-neutral-200/70 dark:border-neutral-800/70` |
| 表格边框 | `#F5F5F5` | `#262626` | `border-neutral-100 dark:border-neutral-800` |
| 聚焦边框 | `rgba(0,0,0,0.05)` | - | `ring-1 ring-black/5` |

---

## 🧩 组件规范

### 组件架构
项目采用**原子化组件设计**，组件分为以下层次：

```
src/components/
├── Card           # 卡片容器（基础组件）
├── SectionHeader  # 区块标题（组合组件）
├── KPI            # 关键指标卡片（组合组件）
└── Table          # 数据表格（组合组件）
```

### 核心组件

#### 1. Card 卡片组件
```tsx
<Card className={className}>
  {children}
</Card>
```

**特性**：
- 统一的圆角、阴影、边框样式
- 支持深色模式
- 毛玻璃效果
- 可扩展 className

**样式特征**：
- `rounded-2xl`（16px 圆角）
- `bg-white/70 dark:bg-neutral-900/70`（半透明背景）
- `backdrop-blur`（毛玻璃）
- `shadow-sm ring-1 ring-black/5`（阴影与边框）

#### 2. SectionHeader 区块标题
```tsx
<SectionHeader 
  icon={IconComponent}
  title="标题"
  subtitle="副标题"
  right={<RightContent />}
/>
```

**特性**：
- 左侧图标 + 标题 + 副标题布局
- 可选右侧内容区
- 统一的底部分割线

**样式特征**：
- 图标容器：`p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800`
- 标题：`text-base font-semibold`
- 副标题：`text-xs text-neutral-500`

#### 3. KPI 关键指标卡片
```tsx
<KPI 
  label="指标名称"
  value="77.43%"
  trend="趋势描述"
  icon={IconComponent}
/>
```

**特性**：
- 上方标签 + 图标
- 中间大号数值
- 下方趋势信息
- 自动继承 Card 样式

**样式特征**：
- 标签：`text-xs text-neutral-500`
- 数值：`text-2xl font-bold tracking-tight`
- 趋势：`text-xs text-neutral-500`

#### 4. Table 数据表格
```tsx
<Table 
  keyField="id"
  columns={[
    { key: 'name', title: '名称' },
    { key: 'value', title: '数值', render: (v) => `${v}%` }
  ]}
  data={dataArray}
/>
```

**特性**：
- 支持自定义列渲染函数
- 响应式横向滚动
- 统一的表格样式

**样式特征**：
- 表头：`text-neutral-500 font-medium`
- 单元格：`px-4 py-3 whitespace-nowrap`
- 行分割：`border-t border-neutral-100 dark:border-neutral-800`

---

## 📁 项目结构规范

```
TrionDesign/
├── src/
│   ├── App.tsx              # 主应用组件（<227行）
│   ├── main.tsx             # 应用入口
│   ├── index.css            # 全局样式（Tailwind 引入）
│   ├── components/
│   │   └── index.tsx        # 组件导出（<63行）
│   ├── types/
│   │   └── index.ts         # 类型定义（<99行）
│   └── data/
│       └── index.ts         # 模拟数据（<77行）
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
├── tsconfig.json            # TypeScript 配置
├── postcss.config.js        # PostCSS 配置
├── package.json             # 依赖管理
└── docs/                    # 文档目录
    └── 前端开发规范.md       # 本文档
```

### 目录职责

| 目录/文件 | 职责 |
|----------|------|
| `src/components/` | 存放可复用的 UI 组件 |
| `src/types/` | 存放 TypeScript 类型定义 |
| `src/data/` | 存放模拟数据或数据转换逻辑 |
| `src/*.tsx` | 页面级组件或应用入口 |

---

## 💻 代码规范

### 1. 文件组织规范
- ✅ **单个代码文件不超过 500 行**（项目硬性规则）
- ✅ 组件、类型、数据严格分离
- ✅ 使用路径别名 `@/` 引用 `src/` 目录

### 2. TypeScript 规范

#### 严格模式配置
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

#### 类型定义要求
- ✅ 所有组件 Props 必须定义类型接口
- ✅ 数据模型必须定义类型接口
- ✅ 使用 `React.FC<Props>` 或 `React.ReactElement` 标注组件类型
- ✅ 泛型组件使用 `<T extends Record<string, any>>`

#### 示例
```typescript
// ✅ 正确：组件 Props 类型定义
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  // ...
);

// ✅ 正确：数据类型定义
export interface ResponseRateData {
  t: string;
  rate: number;
}
```

### 3. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `Card.tsx`, `SectionHeader.tsx` |
| 组件名称 | PascalCase | `Card`, `KPI`, `SectionHeader` |
| 类型/接口 | PascalCase + Suffix | `CardProps`, `ResponseRateData` |
| 变量/函数 | camelCase | `responseRate`, `networkHealth` |
| 常量 | camelCase | `transType`, `clients` |
| 路径别名 | `@/` | `@/components`, `@/types` |

### 4. 组件编写规范

#### 函数式组件
- ✅ 优先使用箭头函数定义组件
- ✅ 使用解构赋值接收 Props
- ✅ 默认值在参数中声明

```typescript
// ✅ 推荐
export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/70 ${className}`}>
    {children}
  </div>
);
```

#### 泛型组件
```typescript
// ✅ 推荐：Table 组件支持泛型
export const Table = <T extends Record<string, any>>({ 
  columns, 
  data, 
  keyField 
}: TableProps<T>): React.ReactElement => (
  // ...
);
```

### 5. 样式规范

#### Tailwind CSS 使用原则
- ✅ **优先使用 Tailwind 工具类**，避免自定义 CSS
- ✅ 使用 `dark:` 变体支持深色模式
- ✅ 复杂样式通过组合工具类实现
- ✅ 使用模板字符串动态拼接类名

```typescript
// ✅ 推荐：动态类名
<div className={`rounded-2xl bg-white/70 dark:bg-neutral-900/70 ${className}`}>

// ✅ 推荐：深色模式
<div className="bg-neutral-50 dark:bg-neutral-950">

// ❌ 不推荐：自定义 CSS
<div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.7)' }}>
```

#### 常用样式模式

**卡片容器**
```tsx
className="rounded-2xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur shadow-sm ring-1 ring-black/5"
```

**毛玻璃背景**
```tsx
className="backdrop-blur bg-white/70 dark:bg-neutral-900/60"
```

**图标容器**
```tsx
className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800"
```

**按钮样式**
```tsx
// 主按钮
className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"

// 次按钮
className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800"
```

---

## 🎭 动画规范

### Framer Motion 使用

项目使用 **Framer Motion** 实现平滑的动画效果。

#### 入场动画
```tsx
<motion.div 
  initial={{ scale: 0.9, opacity: 0 }} 
  animate={{ scale: 1, opacity: 1 }}
>
  {/* 内容 */}
</motion.div>
```

#### 动画原则
- ✅ 仅在关键元素使用动画（如图标、卡片入场）
- ✅ 避免过度动画影响性能
- ✅ 动画时长保持在 200-500ms
- ✅ 使用自然缓动曲线

---

## 📊 图表规范

### Recharts 使用

项目使用 **Recharts** 进行数据可视化。

#### 图表类型
- **LineChart** - 折线图（用于趋势数据）
- **AreaChart** - 面积图（用于多维度对比）

#### 配置规范

**通用配置**
```tsx
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="t" />
    <YAxis />
    <Tooltip />
    <Legend />
    {/* 图表内容 */}
  </LineChart>
</ResponsiveContainer>
```

**图表容器**
```tsx
<div className="h-80 p-4">
  <ResponsiveContainer width="100%" height="100%">
    {/* 图表 */}
  </ResponsiveContainer>
</div>
```

#### 图表元素
- **网格**：`strokeDasharray="3 3"` 虚线网格
- **数据线**：`strokeWidth={2}` 线宽、`dot={false}` 隐藏数据点
- **参考线**：用于标记关键时间点或阈值
- **参考区域**：用于标记异常时间段

---

## 📦 构建与部署

### Vite 配置

#### 路径别名
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

#### 开发命令
```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

### TypeScript 配置要点
- **目标版本**：ES2020
- **模块解析**：bundler 模式
- **JSX**：react-jsx（新版 JSX 转换）
- **严格模式**：启用所有严格检查

---

## 🎯 最佳实践

### 1. 性能优化
- ✅ 图表数据使用 `useMemo` 缓存
- ✅ 大数据列表使用虚拟滚动
- ✅ 图片使用懒加载
- ✅ 避免内联函数作为 Props

### 2. 可访问性（a11y）
- ✅ 使用语义化 HTML 标签
- ✅ 图标组件设置合适的尺寸和颜色对比度
- ✅ 表格使用 `<table>` 语义化结构
- ✅ 按钮使用 `<button>` 而非 `<div>`

### 3. 响应式设计
- ✅ 使用 Tailwind 响应式断点（`md:`, `lg:`）
- ✅ 容器使用 `w-full` 保证宽度适配
- ✅ 表格添加横向滚动 `overflow-x-auto`

### 4. 深色模式
- ✅ 所有颜色类都需提供 `dark:` 变体
- ✅ 测试两种模式下的对比度
- ✅ 避免硬编码颜色值

---

## 🔧 开发工作流

### 1. 新增组件
```bash
# 1. 在 src/components/ 创建组件
# 2. 在 src/types/index.ts 定义 Props 类型
# 3. 在 src/components/index.tsx 导出组件
# 4. 在页面中引入使用
```

### 2. 新增数据模型
```bash
# 1. 在 src/types/index.ts 定义数据类型
# 2. 在 src/data/index.ts 创建模拟数据
# 3. 在组件中引入使用
```

### 3. 代码检查
- TypeScript 严格模式会自动检查类型错误
- Vite 会在开发时报告编译错误
- 确保无 Console 警告和错误

---

## 📚 参考资源

### 官方文档
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [Recharts 文档](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

### 设计资源
- [Tailwind UI Components](https://tailwindui.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Glassmorphism Generator](https://hype4.academy/tools/glassmorphism-generator)

---

## 📝 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2025-10-24 | 初始版本，完整规范文档 |

---

## 👥 维护者

本文档由项目团队维护，如有疑问或建议，请联系项目负责人。

---

**最后更新时间**：2025年10月24日

