# Network Metrics Explanation - 实现指南

## 📁 文件结构

```
src/
├── components/
│   ├── NetworkCorrelationSidebar.tsx      (修改)
│   ├── MetricInfoTooltip.tsx              (新建)
│   └── CustomLegend.tsx                   (新建)
├── config/
│   └── networkMetricsConfig.ts            (新建)
├── utils/
│   └── metricStatusCalculator.ts          (新建)
└── types/
    └── networkMetrics.ts                  (新建)
```

## 🔧 实现步骤

### Step 1: 创建类型定义

**文件**: `src/types/networkMetrics.ts`

```typescript
export type MetricKey = 'packetLoss' | 'retransmission' | 'duplicateAck' | 'tcpSetup' | 'tcpRst';

export type MetricStatus = 'normal' | 'warning' | 'critical';

export interface MetricThreshold {
  warning: number;
  critical: number;
  reverse?: boolean; // true for metrics where higher is better (e.g., TCP Setup)
}

export interface MetricInfo {
  key: MetricKey;
  name: string;
  nameEn: string;
  icon: string;
  definition: string;
  explanation: string;
  impact: string[];
  threshold: MetricThreshold;
  possibleCauses: string[];
  normalMessage?: string;
}

export interface MetricStatusResult {
  status: MetricStatus;
  value: number;
  threshold: MetricThreshold;
  message: string;
}
```

### Step 2: 创建指标配置

**文件**: `src/config/networkMetricsConfig.ts`

```typescript
import type { MetricInfo } from '@/types/networkMetrics';

export const NETWORK_METRICS_CONFIG: Record<string, MetricInfo> = {
  packetLoss: {
    key: 'packetLoss',
    name: '丢包率',
    nameEn: 'Packet Loss',
    icon: '📉',
    definition: '网络传输过程中数据包丢失的比例',
    explanation: '就像寄快递时包裹丢失，需要重新寄送。丢包率越高，数据传输越不可靠。',
    impact: [
      '交易响应时间变长（需要重传丢失的数据）',
      '交易失败率上升（重传超时或连接中断）',
      '用户体验下降（页面加载缓慢、操作卡顿）',
    ],
    threshold: {
      warning: 1,
      critical: 5,
    },
    possibleCauses: [
      '网络设备故障或过载（交换机、路由器）',
      '物理链路质量差（网线、光纤老化）',
      '防火墙或安全设备策略导致丢包',
      '网络拥塞（带宽不足）',
    ],
    normalMessage: '当前网络传输质量良好，数据包丢失率在正常范围内。',
  },
  
  retransmission: {
    key: 'retransmission',
    name: '重传率',
    nameEn: 'Retransmission',
    icon: '🔄',
    definition: 'TCP 协议检测到数据丢失后重新发送的比例',
    explanation: '就像打电话时对方没听清，你需要重复说一遍。重传率高说明网络质量差，需要频繁重复发送数据。',
    impact: [
      '交易处理时间延长（等待重传完成）',
      '网络带宽浪费（同样的数据发送多次）',
      '服务器负载增加（处理重传请求）',
    ],
    threshold: {
      warning: 2,
      critical: 10,
    },
    possibleCauses: [
      '网络丢包（参考 Packet Loss 指标）',
      '网络延迟抖动（延迟不稳定）',
      '接收端处理能力不足（缓冲区溢出）',
      '网络路径不稳定（路由频繁变化）',
    ],
    normalMessage: '当前网络重传率正常，数据传输效率良好。',
  },
  
  duplicateAck: {
    key: 'duplicateAck',
    name: '重复确认',
    nameEn: 'Duplicate ACK',
    icon: '🔁',
    definition: '接收端重复发送确认信号，表示期待的数据包未到达',
    explanation: '就像你在等快递，快递员送来的不是你期待的那个包裹，你会一直说"我要的不是这个"。重复确认多说明数据包到达顺序混乱。',
    impact: [
      '触发快速重传机制（性能下降）',
      '网络吞吐量降低（传输效率下降）',
      '交易响应时间波动（不稳定）',
    ],
    threshold: {
      warning: 3,
      critical: 10,
    },
    possibleCauses: [
      '数据包乱序（网络路径不稳定）',
      '网络拥塞（队列溢出导致丢包）',
      '负载均衡配置不当（会话保持问题）',
      '网络设备性能瓶颈',
    ],
    normalMessage: '当前数据包传输顺序正常，网络路径稳定。',
  },
  
  tcpSetup: {
    key: 'tcpSetup',
    name: 'TCP 建连成功率',
    nameEn: 'TCP Setup Success',
    icon: '🔗',
    definition: 'TCP 三次握手成功建立连接的比例',
    explanation: '就像打电话时能否接通。建连成功率低说明很多"电话"打不通，交易无法开始。',
    impact: [
      '交易无法发起（连接失败）',
      '用户看到连接错误提示',
      '交易成功率直接下降',
    ],
    threshold: {
      warning: 99.5,
      critical: 95,
      reverse: true, // Higher is better
    },
    possibleCauses: [
      '服务器资源耗尽（连接数、内存、CPU）',
      '防火墙或安全设备限制（连接数限制、SYN Flood 防护）',
      '网络设备故障（交换机、负载均衡器）',
      '服务端应用问题（监听队列满、进程崩溃）',
    ],
    normalMessage: '当前网络连接质量良好，TCP 建连成功率正常。',
  },
  
  tcpRst: {
    key: 'tcpRst',
    name: 'TCP 连接重置',
    nameEn: 'TCP RST',
    icon: '⚡',
    definition: 'TCP 连接被强制中断的次数',
    explanation: '就像打电话时突然被挂断。RST 多说明连接经常被异常中断，交易无法完成。',
    impact: [
      '正在进行的交易被中断',
      '交易失败率上升',
      '用户体验极差（操作被打断）',
    ],
    threshold: {
      warning: 1,
      critical: 5,
    },
    possibleCauses: [
      '应用程序异常关闭连接（代码 bug、超时设置）',
      '防火墙或安全设备主动断开（策略限制、异常流量）',
      '服务器资源不足（强制关闭连接释放资源）',
      '网络中间设备故障（NAT 设备、负载均衡器）',
    ],
    normalMessage: '当前 TCP 连接稳定，无异常重置情况。',
  },
};

// Helper function to get metric config by data key
export const getMetricConfigByDataKey = (dataKey: string): MetricInfo | null => {
  const keyMap: Record<string, MetricKey> = {
    'loss': 'packetLoss',
    'retrans': 'retransmission',
    'dupAck': 'duplicateAck',
    'setup': 'tcpSetup',
    'rst': 'tcpRst',
  };
  
  const metricKey = keyMap[dataKey];
  return metricKey ? NETWORK_METRICS_CONFIG[metricKey] : null;
};
```

### Step 3: 创建状态计算工具

**文件**: `src/utils/metricStatusCalculator.ts`

```typescript
import type { MetricStatus, MetricThreshold, MetricStatusResult } from '@/types/networkMetrics';

export const calculateMetricStatus = (
  value: number,
  threshold: MetricThreshold
): MetricStatus => {
  const { warning, critical, reverse = false } = threshold;
  
  if (reverse) {
    // For metrics where higher is better (e.g., TCP Setup Success)
    if (value >= warning) return 'normal';
    if (value >= critical) return 'warning';
    return 'critical';
  } else {
    // For metrics where lower is better (e.g., Packet Loss)
    if (value < warning) return 'normal';
    if (value < critical) return 'warning';
    return 'critical';
  }
};

export const getStatusMessage = (
  status: MetricStatus,
  value: number,
  threshold: MetricThreshold,
  metricName: string,
  unit: string = '%'
): string => {
  const { warning, critical, reverse = false } = threshold;
  
  if (status === 'normal') {
    return `✅ 正常 - ${metricName} ${value}${unit}（正常 ${reverse ? '>' : '<'}${warning}${unit}）`;
  } else if (status === 'warning') {
    return `⚠️ 轻微影响 - ${metricName} ${value}${unit}（正常 ${reverse ? '>' : '<'}${warning}${unit}）`;
  } else {
    return `🔴 严重影响 - ${metricName} ${value}${unit}（正常 ${reverse ? '>' : '<'}${warning}${unit}）`;
  }
};

export const getMetricStatusResult = (
  value: number,
  threshold: MetricThreshold,
  metricName: string,
  unit: string = '%'
): MetricStatusResult => {
  const status = calculateMetricStatus(value, threshold);
  const message = getStatusMessage(status, value, threshold, metricName, unit);
  
  return {
    status,
    value,
    threshold,
    message,
  };
};

// Calculate average value from time series data
export const calculateAverageMetric = (
  data: any[],
  dataKey: string,
  startTime?: string,
  endTime?: string
): number => {
  let filteredData = data;
  
  // Filter by time range if provided
  if (startTime || endTime) {
    filteredData = data.filter(d => {
      if (startTime && d.t < startTime) return false;
      if (endTime && d.t > endTime) return false;
      return true;
    });
  }
  
  if (filteredData.length === 0) return 0;
  
  const sum = filteredData.reduce((acc, d) => acc + (d[dataKey] || 0), 0);
  return sum / filteredData.length;
};
```

### Step 4: 创建 MetricInfoTooltip 组件

**文件**: `src/components/MetricInfoTooltip.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { NETWORK_METRICS_CONFIG } from '@/config/networkMetricsConfig';
import { getMetricStatusResult } from '@/utils/metricStatusCalculator';
import type { MetricKey, MetricStatusResult } from '@/types/networkMetrics';

interface MetricInfoTooltipProps {
  metricKey: MetricKey;
  currentValue?: number;
  unit?: string;
}

export const MetricInfoTooltip: React.FC<MetricInfoTooltipProps> = ({
  metricKey,
  currentValue,
  unit = '%',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const metricInfo = NETWORK_METRICS_CONFIG[metricKey];
  
  if (!metricInfo) return null;
  
  // Calculate status if current value is provided
  const statusResult: MetricStatusResult | null = currentValue !== undefined
    ? getMetricStatusResult(currentValue, metricInfo.threshold, metricInfo.name, unit)
    : null;
  
  // Calculate position when opening
  useEffect(() => {
    if (isOpen && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const tooltipWidth = 320;
      const tooltipHeight = 400; // Estimated max height
      const gap = 8;
      
      let top = rect.top;
      let left = rect.right + gap;
      
      // Check if tooltip would overflow right edge
      if (left + tooltipWidth > viewportWidth - 16) {
        // Position to the left of icon
        left = rect.left - tooltipWidth - gap;
      }
      
      // Check if tooltip would overflow bottom edge
      if (top + tooltipHeight > viewportHeight - 16) {
        top = Math.max(16, viewportHeight - tooltipHeight - 16);
      }
      
      // Ensure minimum top padding
      if (top < 16) {
        top = 16;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen]);
  
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/25';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/25';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/25';
      default:
        return '';
    }
  };
  
  return (
    <>
      {/* Info Icon Button */}
      <button
        ref={iconRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all ${
          isOpen
            ? 'text-blue-700 dark:text-blue-400 scale-110'
            : 'text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110'
        }`}
        aria-label={`查看 ${metricInfo.name} 说明`}
      >
        <Info className="w-full h-full" />
      </button>
      
      {/* Tooltip Portal */}
      {isOpen && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] w-80 max-h-96 overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">{metricInfo.icon}</span>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {metricInfo.name} ({metricInfo.nameEn})
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content */}
          <div className="px-4 py-3 space-y-3 text-xs">
            {/* Definition */}
            <div>
              <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">定义</h5>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {metricInfo.definition}
              </p>
            </div>
            
            {/* Explanation */}
            <div>
              <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">通俗解释</h5>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {metricInfo.explanation}
              </p>
            </div>
            
            {/* Impact */}
            <div>
              <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">对交易的影响</h5>
              <ul className="space-y-1">
                {metricInfo.impact.map((item, index) => (
                  <li key={index} className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Current Status */}
            {statusResult && (
              <div>
                <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">当前状态</h5>
                <div className={`px-3 py-2 rounded-md ${getStatusColor(statusResult.status)}`}>
                  <p className="font-medium leading-relaxed">
                    {statusResult.message}
                  </p>
                </div>
              </div>
            )}
            
            {/* Possible Causes or Normal Message */}
            {statusResult && statusResult.status !== 'normal' ? (
              <div>
                <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">可能原因</h5>
                <ul className="space-y-1">
                  {metricInfo.possibleCauses.map((cause, index) => (
                    <li key={index} className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      • {cause}
                    </li>
                  ))}
                </ul>
              </div>
            ) : statusResult && metricInfo.normalMessage && (
              <div>
                <h5 className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">保持良好</h5>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {metricInfo.normalMessage}
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
```

---

## 📝 后续步骤

1. 创建上述所有文件
2. 修改 `NetworkCorrelationSidebar.tsx` 集成自定义 Legend
3. 添加单元测试
4. 进行用户测试和反馈收集
5. 根据反馈优化解释内容

