import React from "react";

interface NetworkAssessmentProps {
  hasImpact: boolean;
  details: {
    availability: 'healthy' | 'error';
    performance: 'healthy' | 'error';
  };
}

export const NetworkAssessment: React.FC<NetworkAssessmentProps> = ({ hasImpact, details }) => {
  const isHealthy = !hasImpact;

  return (
    <div className={`mx-3 my-2.5 px-3 py-2.5 border-l-4 rounded-lg ${
      isHealthy
        ? 'bg-green-50/60 dark:bg-green-900/25 border-green-500 dark:border-green-400'
        : 'bg-amber-50/60 dark:bg-amber-800/35 border-amber-500 dark:border-amber-400'
    }`}>
      <div className="space-y-1.5">
        {/* Header with Assessment Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isHealthy
              ? 'text-green-700 dark:text-green-200'
              : 'text-amber-700 dark:text-amber-200'
          }`}>
            Assessment
          </span>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-md ${
            isHealthy
              ? 'bg-green-600 dark:bg-green-600'
              : 'bg-amber-300 dark:bg-amber-300'
          }`}>
            <span className={`text-xs font-bold ${
              isHealthy ? 'text-white' : 'text-neutral-900'
            }`}>
              {isHealthy ? 'No Network Impact' : 'Network Impact Detected'}
            </span>
          </div>
        </div>

        {/* Conclusion Text */}
        <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
          {isHealthy ? (
            <>
              Network layer metrics (Availability: <span className="font-medium text-green-700 dark:text-green-300">Normal</span>,
              Performance: <span className="font-medium text-green-700 dark:text-green-300">Normal</span>) show no correlation with response rate degradation.
            </>
          ) : (
            <>
              Network layer issues detected -
              {details.availability === 'error' && <span className="font-medium text-amber-700 dark:text-amber-300"> Availability degraded</span>}
              {details.availability === 'error' && details.performance === 'error' && ', '}
              {details.performance === 'error' && <span className="font-medium text-amber-700 dark:text-amber-300"> Performance degraded</span>}
              {' '}during alert period.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

