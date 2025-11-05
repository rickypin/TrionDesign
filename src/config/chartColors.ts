// 明亮而优雅的配色池 - 避免告警色（红/绿）
export const CHART_COLORS = {
  blue: '#3b82f6',      // 蓝色 - 清晰、专业
  purple: '#a855f7',    // 紫色 - 优雅、现代
  cyan: '#06b6d4',      // 青色 - 明亮、清新
  amber: '#f59e0b',     // 琥珀色 - 温暖、醒目
  pink: '#ec4899',      // 品红 - 活力、鲜明
  indigo: '#6366f1',    // 靛青 - 深邃、稳重
  // Network metrics colors
  packetLoss: '#ef4444',        // 红色 - Packet Loss
  retransmission: '#f97316',    // 橙色 - Retransmission
  duplicateAck: '#eab308',      // 黄色 - Duplicate ACK
  tcpSetupSuccess: '#60a5fa',   // 亮蓝色 - TCP Setup Success (更亮，更易见)
  tcpRst: '#fb923c',            // 亮橙色 - TCP RST (更亮，更易见)
} as const;

