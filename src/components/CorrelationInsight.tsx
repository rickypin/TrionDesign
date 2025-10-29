import React from "react";
import type { CorrelationInsight as CorrelationInsightType } from "@/utils/correlationAnalysis";

interface CorrelationInsightProps {
  insight: CorrelationInsightType;
}

export const CorrelationInsight: React.FC<CorrelationInsightProps> = ({ insight }) => {
  return (
    <div className="mx-4 sm:mx-6 my-3 sm:my-4 px-4 sm:px-5 py-3 sm:py-3.5 bg-amber-50/60 dark:bg-amber-800/35 border-l-4 border-amber-500 dark:border-amber-400 rounded-lg">
      <div className="space-y-2">
        {/* Header with Primary Factor Badge (only if primaryFactor exists) */}
        {insight.primaryFactor && (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-200 uppercase tracking-wider">
              Primary Factor
            </span>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-amber-300 dark:bg-amber-300">
              <span className="text-sm font-semibold text-neutral-900">
                {insight.primaryFactor.type === 'transType' ? 'Trans Type' :
                 insight.primaryFactor.type === 'server' ? 'Server' :
                 insight.primaryFactor.type === 'client' ? 'Client' :
                 insight.primaryFactor.type === 'channel' ? 'Channel' : 'Multiple'}:
              </span>
              <span className="text-sm font-bold text-neutral-900">
                {insight.primaryFactor.name}
              </span>
            </div>
          </div>
        )}

        {/* Conclusion Text */}
        <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
          {insight.conclusion}
        </p>
      </div>
    </div>
  );
};

