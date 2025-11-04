import React, { useState, useEffect } from 'react';
import { X, AlertCircle, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { NETWORK_METRICS_CONFIG } from '@/config/networkMetricsConfig';
import { getMetricStatusResult } from '@/utils/metricStatusCalculator';
import type { MetricKey, MetricStatus } from '@/types/networkMetrics';

interface MetricExplanationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeMetric?: MetricKey;
  metricValues: Record<MetricKey, number | undefined>;
  onMetricChange?: (metric: MetricKey) => void;
}

export const MetricExplanationPanel: React.FC<MetricExplanationPanelProps> = ({
  isOpen,
  onClose,
  activeMetric,
  metricValues,
  onMetricChange,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(activeMetric || 'packetLoss');

  // Update selected metric when activeMetric prop changes
  useEffect(() => {
    if (activeMetric) {
      setSelectedMetric(activeMetric);
    }
  }, [activeMetric]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleTabClick = (metric: MetricKey) => {
    setSelectedMetric(metric);
    onMetricChange?.(metric);
  };

  if (!isOpen) return null;

  const metricConfig = NETWORK_METRICS_CONFIG[selectedMetric];
  const currentValue = metricValues[selectedMetric];
  const statusResult = currentValue !== undefined 
    ? getMetricStatusResult(selectedMetric, currentValue)
    : null;

  // Get status icon and color
  const getStatusIcon = (status: MetricStatus) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
  };

  const getStatusBadgeClass = (status: MetricStatus) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    }
  };

  // All metrics for tabs
  const allMetrics: MetricKey[] = ['packetLoss', 'retransmission', 'duplicateAck', 'tcpSetup', 'tcpRst'];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 shadow-2xl animate-slide-up">
        {/* Header with Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              指标详情
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="关闭"
            >
              <X className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto px-4 pb-2 gap-2 scrollbar-hide">
            {allMetrics.map((metric) => {
              const config = NETWORK_METRICS_CONFIG[metric];
              const value = metricValues[metric];
              const status = value !== undefined 
                ? getMetricStatusResult(metric, value).status 
                : 'normal';
              
              return (
                <button
                  key={metric}
                  onClick={() => handleTabClick(metric)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedMetric === metric
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  <span className="text-base">{config.icon}</span>
                  <span>{config.name}</span>
                  {value !== undefined && (
                    <span className={`ml-1 ${
                      status === 'critical' ? 'text-red-500' :
                      status === 'warning' ? 'text-amber-500' :
                      'text-green-500'
                    }`}>
                      {status === 'critical' ? '●' : status === 'warning' ? '●' : '●'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 max-h-[50vh] overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Metric Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{metricConfig.icon}</span>
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {metricConfig.name}
                  </h4>
                  {statusResult && (
                    <div className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusBadgeClass(statusResult.status)}`}>
                      {getStatusIcon(statusResult.status)}
                      <span>当前状态：{currentValue?.toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Definition */}
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700">
              <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                📖 定义
              </h5>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {metricConfig.definition}
              </p>
            </div>

            {/* Explanation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1.5">
                💡 通俗解释
              </h5>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {metricConfig.explanation}
              </p>
            </div>

            {/* Business Impact */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <h5 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1.5">
                📊 对业务的影响
              </h5>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                {metricConfig.impact}
              </p>
            </div>

            {/* Current Status Message */}
            {statusResult && (
              <div className={`rounded-lg p-3 border ${
                statusResult.status === 'critical' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : statusResult.status === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}>
                <h5 className={`text-sm font-semibold mb-1.5 ${
                  statusResult.status === 'critical'
                    ? 'text-red-700 dark:text-red-300'
                    : statusResult.status === 'warning'
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-green-700 dark:text-green-300'
                }`}>
                  {statusResult.status === 'critical' ? '🚨 严重影响' :
                   statusResult.status === 'warning' ? '⚠️ 轻微影响' :
                   '✅ 正常状态'}
                </h5>
                <p className={`text-sm ${
                  statusResult.status === 'critical'
                    ? 'text-red-600 dark:text-red-400'
                    : statusResult.status === 'warning'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {statusResult.message}
                </p>
              </div>
            )}

            {/* Possible Causes */}
            {statusResult && statusResult.status !== 'normal' && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                <h5 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                  🔍 可能的原因
                </h5>
                <ul className="space-y-1.5">
                  {metricConfig.possibleCauses.map((cause, index) => (
                    <li key={index} className="text-sm text-orange-600 dark:text-orange-400 flex items-start gap-2">
                      <span className="text-orange-500 dark:text-orange-400 mt-0.5">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Threshold Info */}
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700">
              <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                📏 阈值参考
              </h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    正常: {metricConfig.threshold.reverse 
                      ? `≥ ${metricConfig.threshold.warning}%`
                      : `< ${metricConfig.threshold.warning}%`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    警告: {metricConfig.threshold.reverse
                      ? `${metricConfig.threshold.critical}% - ${metricConfig.threshold.warning}%`
                      : `${metricConfig.threshold.warning}% - ${metricConfig.threshold.critical}%`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    严重: {metricConfig.threshold.reverse
                      ? `< ${metricConfig.threshold.critical}%`
                      : `≥ ${metricConfig.threshold.critical}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

