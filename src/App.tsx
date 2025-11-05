import React, { useState, useMemo, useCallback } from "react";
import { AlertTriangle, Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { Card, NetworkCorrelationSidebar, BusinessImpactSection, AlertSummaryChart } from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useAlertData } from "@/hooks/useAlertData";
import { switchScenario, getCurrentScenario } from "@/api/alertApi";
import { formatNumber } from "@/utils/format";
import { findOutliers } from "@/utils/tableColoring";
import { CHART_COLORS } from "@/config/chartColors";
import type { ScenarioId } from "@/types/alert";

export default function App(): React.ReactElement {
  const [currentScenario, setCurrentScenario] = useState<ScenarioId>(getCurrentScenario());
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);
  const [switchingScenario, setSwitchingScenario] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Fetch all alert data from API
  const {
    alertMetadata,
    dimensionConfig,
    scenarioStatus,
    responseRate: rawResponseRate,
    networkHealth,
    tcpHealth,
    transType,
    clients,
    servers,
    channels,
    returnCodes,
    loading,
    error,
    refresh,
  } = useAlertData();

  // Merge baseline data with response rate data - memoized for performance
  const responseRate = useMemo(() => {
    if (!alertMetadata || !rawResponseRate) {
      return rawResponseRate || [];
    }

    if (alertMetadata.baseline?.type === 'dynamic' && alertMetadata.baseline.data) {
      // Create a map of baseline data by time
      const baselineMap = new Map(
        alertMetadata.baseline.data.map(b => [b.t, { baseline: b.baseline, upper: b.upper, lower: b.lower }])
      );

      // Merge baseline data into response rate data
      return rawResponseRate.map(d => ({
        ...d,
        baseline: baselineMap.get(d.t)?.baseline,
        baselineUpper: baselineMap.get(d.t)?.upper,
        baselineLower: baselineMap.get(d.t)?.lower,
      }));
    }
    return rawResponseRate;
  }, [rawResponseRate, alertMetadata]);

  // Find most impacted items using table coloring logic (outlier detection)
  interface MostImpactedItem {
    type: 'transType' | 'returnCode' | 'server' | 'client' | 'channel';
    name: string;
    impact: number;
  }

  const items: MostImpactedItem[] = [];

  // Find outliers in each dimension
  const transTypeOutliers = findOutliers(transType, 'impact');
  transTypeOutliers.forEach(item => {
    items.push({ type: 'transType', name: item.type, impact: item.impact });
  });

  const returnCodeOutliers = findOutliers(returnCodes, 'impact');
  returnCodeOutliers.forEach(item => {
    items.push({ type: 'returnCode', name: String(item.code), impact: item.impact });
  });

  const serverOutliers = findOutliers(servers, 'impact');
  serverOutliers.forEach(item => {
    items.push({ type: 'server', name: item.ip, impact: item.impact });
  });

  const clientOutliers = findOutliers(clients, 'impact');
  clientOutliers.forEach(item => {
    items.push({ type: 'client', name: item.ip, impact: item.impact });
  });

  const channelOutliers = findOutliers(channels, 'impact');
  channelOutliers.forEach(item => {
    items.push({ type: 'channel', name: item.channel, impact: item.impact });
  });

  // Sort by impact descending
  const mostImpactedItems = items.sort((a, b) => b.impact - a.impact);



  // Dynamic chart configuration based on metric type - memoized for performance
  const chartConfig = useMemo(() => {
    if (!alertMetadata) {
      return {
        yAxisDomain: [50, 100] as [number, number],
        yAxisTickFormatter: (v: number) => `${formatNumber(v)}%`,
        tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}%` : v),
        lineName: 'Transaction Response Rate',
      };
    }

    switch (alertMetadata.metricType) {
      case 'transactionCount':
        return {
          yAxisDomain: [0, 1000] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}/m` : v),
          lineName: 'Transaction Count',
        };
      case 'responseRate':
        // S3 scenario (pmtud-black-hole) uses 70-100 range for better visualization
        const yAxisMinResponse = currentScenario === 'pmtud-black-hole' ? 70 : 50;
        return {
          yAxisDomain: [yAxisMinResponse, 100] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}%`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}%` : v),
          lineName: 'Transaction Response Rate',
        };
      case 'successRate':
        const yAxisMinSuccess = currentScenario === 'pmtud-black-hole' ? 70 : 50;
        return {
          yAxisDomain: [yAxisMinSuccess, 100] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}%`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}%` : v),
          lineName: 'Transaction Success Rate',
        };
      case 'avgResponseTime':
        return {
          yAxisDomain: [0, 200] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}ms`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}ms` : v),
          lineName: 'Average Response Time',
        };
      default:
        return {
          yAxisDomain: [50, 100] as [number, number],
          yAxisTickFormatter: (v: number) => `${formatNumber(v)}%`,
          tooltipFormatter: (v: number | string) => (typeof v === "number" ? `${formatNumber(v)}%` : v),
          lineName: 'Transaction Response Rate',
        };
    }
  }, [alertMetadata, currentScenario]);

  // Dynamic success rate column configuration based on metric type - memoized for performance
  const successRateColumnConfig = useMemo(() => {
    if (!alertMetadata) {
      return {
        title: 'Response Rate',
        tooltip: 'Success rate: baseline% → current% (↓ decline in percentage points)',
      };
    }

    switch (alertMetadata.metricType) {
      case 'successRate':
        return {
          title: 'Success Rate',
          tooltip: 'Success rate: baseline% → current% (↓ decline in percentage points)',
        };
      case 'responseRate':
      default:
        return {
          title: 'Response Rate',
          tooltip: 'Success rate: baseline% → current% (↓ decline in percentage points)',
        };
    }
  }, [alertMetadata]);

  // Get reference area color based on network assessment status - memoized for stable reference
  const getReferenceAreaColor = useCallback((chartType: string) => {
    if (!scenarioStatus) return '#16a34a';

    if (chartType === 'network') {
      // Performance chart
      return scenarioStatus.networkAssessment.details.performance === 'error' ? '#f59e0b' : '#16a34a';
    } else {
      // Availability chart
      return scenarioStatus.networkAssessment.details.availability === 'error' ? '#f59e0b' : '#16a34a';
    }
  }, [scenarioStatus]);

  const getReferenceLineColor = useCallback((chartType: string) => {
    if (!scenarioStatus) {
      return {
        light: '#16a34a',
        dark: '#4ade80'
      };
    }

    const isError = chartType === 'network'
      ? scenarioStatus.networkAssessment.details.performance === 'error'
      : scenarioStatus.networkAssessment.details.availability === 'error';

    if (isError) {
      return {
        light: '#d97706', // amber-600
        dark: '#fbbf24'   // amber-400
      };
    } else {
      return {
        light: '#16a34a', // green-600
        dark: '#4ade80'   // green-400
      };
    }
  }, [scenarioStatus]);

  // Handle scenario switch with proper error handling and race condition prevention - memoized for stable reference
  const handleScenarioSwitch = useCallback(async (scenarioId: ScenarioId) => {
    // Prevent switching if already switching or if it's the same scenario
    if (switchingScenario || scenarioId === currentScenario) {
      return;
    }

    const previousScenario = currentScenario;

    try {
      setSwitchingScenario(true);
      setSwitchError(null);

      // First, switch the scenario in the backend
      await switchScenario(scenarioId);

      // Only update UI state after successful backend switch
      setCurrentScenario(scenarioId);
      setIsNetworkExpanded(false);

      // Refresh data after scenario switch
      await refresh();
    } catch (err) {
      console.error('Failed to switch scenario:', err);

      // Rollback to previous scenario on error
      setCurrentScenario(previousScenario);

      // Set error message for user feedback
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch scenario';
      setSwitchError(errorMessage);

      // Auto-clear error after 5 seconds
      setTimeout(() => setSwitchError(null), 5000);
    } finally {
      setSwitchingScenario(false);
    }
  }, [currentScenario, switchingScenario, refresh]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-neutral-600 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error || !alertMetadata || !scenarioStatus) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          Error loading data: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-800/80 border-b border-neutral-200/70 dark:border-neutral-600/50">
        {/* Error Banner */}
        {switchError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span>{switchError}</span>
            </div>
          </div>
        )}

        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-baseline gap-2 sm:gap-3"
            >
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                Trion
              </span>
              <span className="hidden sm:inline text-xl font-medium text-neutral-600 dark:text-neutral-400 uppercase">
                Intelligent Alert Analysis
              </span>
            </motion.div>

            {/* Scenario Switcher & Theme Toggle */}
            <div className="flex items-center gap-2">
              {/* Scenario Buttons */}
              <div className="flex items-center gap-2 mr-2">
                <button
                  onClick={() => handleScenarioSwitch('app-gc')}
                  disabled={switchingScenario}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    currentScenario === 'app-gc'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  } ${switchingScenario ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="S1: App GC Scenario"
                >
                  <span className={currentScenario === 'app-gc' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    S1
                  </span>
                </button>
                <button
                  onClick={() => handleScenarioSwitch('session-table-full')}
                  disabled={switchingScenario}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    currentScenario === 'session-table-full'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  } ${switchingScenario ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="S2: Session Table Full Scenario"
                >
                  <span className={currentScenario === 'session-table-full' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    S2
                  </span>
                </button>
                <button
                  onClick={() => handleScenarioSwitch('pmtud-black-hole')}
                  disabled={switchingScenario}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    currentScenario === 'pmtud-black-hole'
                      ? 'bg-neutral-200 dark:bg-neutral-600 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-150 dark:hover:bg-neutral-650'
                  } ${switchingScenario ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="S3: PMTUD Black Hole Scenario"
                >
                  <span className={currentScenario === 'pmtud-black-hole' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                    S3
                  </span>
                </button>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => {
                  // 循环切换：light -> dark -> system
                  if (theme === 'light') setTheme('dark');
                  else if (theme === 'dark') setTheme('system');
                  else setTheme('light');
                }}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                title={theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
              >
                {theme === 'system' ? (
                  <Monitor className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                ) : resolvedTheme === 'dark' ? (
                  <Moon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                ) : (
                  <Sun className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Alert Summary */}
        <AlertSummaryChart
          alertMetadata={alertMetadata}
          responseRate={responseRate}
          chartConfig={chartConfig}
          resolvedTheme={resolvedTheme}
        />

        {/* Responsive Layout: Business Impact (flex) + Network Correlation Sidebar (280px) */}
        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4">
          {/* Business Impact - Takes remaining space on xl screens, full width on smaller screens */}
          {!isNetworkExpanded && (
            <BusinessImpactSection
              mostImpactedItems={mostImpactedItems}
              transType={transType}
              returnCodes={returnCodes}
              channels={channels}
              servers={servers}
              clients={clients}
              dimensionConfig={dimensionConfig}
              successRateColumnConfig={successRateColumnConfig}
            />
          )}

          {/* Network Correlation - Sidebar Version (Fixed 280px width on xl screens) or Full Width when expanded */}
          <Card className={isNetworkExpanded ? "flex-1" : "xl:w-[280px] xl:flex-shrink-0"}>
            {/* Sidebar Network Correlation Component */}
            <NetworkCorrelationSidebar
              networkHealth={networkHealth}
              tcpHealth={tcpHealth}
              alertMetadata={alertMetadata}
              hasImpact={scenarioStatus.networkAssessment.hasImpact}
              details={scenarioStatus.networkAssessment.details}
              resolvedTheme={resolvedTheme}
              formatNumber={formatNumber}
              CHART_COLORS={CHART_COLORS}
              getReferenceAreaColor={getReferenceAreaColor}
              getReferenceLineColor={getReferenceLineColor}
              onExpandChange={setIsNetworkExpanded}
              serverIps={servers.map(s => s.ip)}
            />
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-xs text-neutral-500 text-center py-6">Demo view · Modern, minimal & clear · Built with React + Tailwind + Recharts</div>
      </main>
    </div>
  );
}

