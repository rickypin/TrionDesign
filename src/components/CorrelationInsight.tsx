import React from "react";
import type { CorrelationInsight as CorrelationInsightType } from "@/utils/correlationAnalysis";

interface CorrelationInsightProps {
  insight: CorrelationInsightType;
}

export const CorrelationInsight: React.FC<CorrelationInsightProps> = ({ insight }) => {
  return (
    <div className="mx-6 my-4 px-5 py-3.5 bg-red-50/60 dark:bg-red-900/25 border-l-4 border-red-500 dark:border-red-400 rounded-lg">
      <div className="space-y-2">
        {/* Header with Primary Factor Badge */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-red-700 dark:text-red-200 uppercase tracking-wider">
            Primary Factor
          </span>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-red-600 dark:bg-red-600">
            <span className="text-sm font-semibold text-red-100">
              {insight.primaryFactor.type === 'transType' ? 'Service' :
               insight.primaryFactor.type === 'server' ? 'Server' :
               insight.primaryFactor.type === 'client' ? 'Client' : 'Multiple'}:
            </span>
            <span className="text-sm font-bold text-white">
              {insight.primaryFactor.name}
            </span>
          </div>
        </div>

        {/* Conclusion Text */}
        <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
          {insight.conclusion}
        </p>
      </div>
    </div>
  );
};

