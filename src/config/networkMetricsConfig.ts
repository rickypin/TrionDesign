import type { MetricInfo, MetricKey } from '@/types/networkMetrics';

export const NETWORK_METRICS_CONFIG: Record<string, MetricInfo> = {
  packetLoss: {
    key: 'packetLoss',
    name: '丢包率',
    nameEn: 'Packet Loss',
    icon: '📉',
    definition: 'The percentage of data packets lost during network transmission',
    explanation: 'Like packages getting lost during delivery and needing to be resent. Higher packet loss means less reliable data transmission.',
    impact: [
      'Increased transaction response time (retransmission of lost data required)',
      'Higher transaction failure rate (retransmission timeout or connection interruption)',
      'Degraded user experience (slow page loading, laggy operations)',
    ],
    threshold: {
      warning: 1,
      critical: 5,
    },
    possibleCauses: [
      'Network device failure or overload (switches, routers)',
      'Poor physical link quality (aging cables, fiber optics)',
      'Firewall or security device policies causing packet drops',
      'Network congestion (insufficient bandwidth)',
    ],
    normalMessage: 'Current network transmission quality is good, packet loss rate is within normal range.',
  },

  retransmission: {
    key: 'retransmission',
    name: '重传率',
    nameEn: 'Retransmission',
    icon: '🔄',
    definition: 'The percentage of data retransmitted after TCP protocol detects data loss',
    explanation: 'Like repeating yourself when someone didn\'t hear you clearly on a phone call. High retransmission rate indicates poor network quality requiring frequent data resending.',
    impact: [
      'Extended transaction processing time (waiting for retransmission to complete)',
      'Wasted network bandwidth (same data sent multiple times)',
      'Increased server load (processing retransmission requests)',
    ],
    threshold: {
      warning: 2,
      critical: 10,
    },
    possibleCauses: [
      'Network packet loss (refer to Packet Loss metric)',
      'Network latency jitter (unstable latency)',
      'Insufficient receiver processing capacity (buffer overflow)',
      'Unstable network path (frequent routing changes)',
    ],
    normalMessage: 'Current network retransmission rate is normal, data transmission efficiency is good.',
  },

  duplicateAck: {
    key: 'duplicateAck',
    name: '重复确认',
    nameEn: 'Duplicate ACK',
    icon: '🔁',
    definition: 'Receiver repeatedly sends acknowledgment signals indicating expected packets have not arrived',
    explanation: 'Like waiting for a package and the delivery person brings the wrong one, you keep saying "this is not what I ordered". High duplicate ACKs indicate packets arriving out of order.',
    impact: [
      'Triggers fast retransmit mechanism (performance degradation)',
      'Reduced network throughput (decreased transmission efficiency)',
      'Fluctuating transaction response time (instability)',
    ],
    threshold: {
      warning: 3,
      critical: 10,
    },
    possibleCauses: [
      'Packet reordering (unstable network path)',
      'Network congestion (queue overflow causing packet loss)',
      'Improper load balancer configuration (session persistence issues)',
      'Network device performance bottleneck',
    ],
    normalMessage: 'Current packet transmission order is normal, network path is stable.',
  },

  tcpSetup: {
    key: 'tcpSetup',
    name: 'TCP 建连成功率',
    nameEn: 'TCP Setup Success',
    icon: '🔗',
    definition: 'The percentage of successful TCP three-way handshake connections',
    explanation: 'Like whether a phone call can connect. Low connection success rate means many "calls" fail to connect, transactions cannot start.',
    impact: [
      'Transactions cannot be initiated (connection failure)',
      'Users see connection error messages',
      'Transaction success rate directly decreases',
    ],
    threshold: {
      warning: 99.5,
      critical: 95,
      reverse: true, // Higher is better
    },
    possibleCauses: [
      'Server resource exhaustion (connections, memory, CPU)',
      'Firewall or security device restrictions (connection limits, SYN Flood protection)',
      'Network device failure (switches, load balancers)',
      'Server application issues (listen queue full, process crash)',
    ],
    normalMessage: 'Current network connection quality is good, TCP setup success rate is normal.',
  },

  tcpRst: {
    key: 'tcpRst',
    name: 'TCP 连接重置',
    nameEn: 'TCP RST',
    icon: '⚡',
    definition: 'The number of times TCP connections are forcibly terminated',
    explanation: 'Like a phone call suddenly being hung up. High RST count indicates connections are frequently interrupted abnormally, transactions cannot complete.',
    impact: [
      'Ongoing transactions are interrupted',
      'Increased transaction failure rate',
      'Extremely poor user experience (operations interrupted)',
    ],
    threshold: {
      warning: 1,
      critical: 5,
    },
    possibleCauses: [
      'Application abnormally closes connection (code bugs, timeout settings)',
      'Firewall or security device actively disconnects (policy restrictions, abnormal traffic)',
      'Insufficient server resources (forcibly closing connections to free resources)',
      'Network intermediary device failure (NAT devices, load balancers)',
    ],
    normalMessage: 'Current TCP connections are stable, no abnormal resets.',
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

