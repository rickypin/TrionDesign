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
    <div className={`mx-6 my-4 px-5 py-3.5 border-l-4 rounded-lg ${
      isHealthy
        ? 'bg-green-50/60 dark:bg-green-900/25 border-green-500 dark:border-green-400'
        : 'bg-red-50/60 dark:bg-red-900/25 border-red-500 dark:border-red-400'
    }`}>
      <div className="space-y-2">
        {/* Header with Assessment Badge */}
        <div className="flex items-center gap-2.5">
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isHealthy
              ? 'text-green-700 dark:text-green-200'
              : 'text-red-700 dark:text-red-200'
          }`}>
            Assessment
          </span>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md ${
            isHealthy
              ? 'bg-green-600 dark:bg-green-600'
              : 'bg-red-600 dark:bg-red-600'
          }`}>
            <span className="text-sm font-bold text-white">
              {isHealthy ? 'No Network Impact' : 'Network Impact Detected'}
            </span>
          </div>
        </div>

        {/* Conclusion Text */}
        <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
          {isHealthy ? (
            <>
              Network layer metrics (Availability: <span className="font-medium text-green-700 dark:text-green-300">Normal</span>,
              Performance: <span className="font-medium text-green-700 dark:text-green-300">Normal</span>) show no correlation with response rate degradation.
            </>
          ) : (
            <>
              Network layer issues detected -
              {details.availability === 'error' && <span className="font-medium text-red-700 dark:text-red-300"> Availability degraded</span>}
              {details.availability === 'error' && details.performance === 'error' && ', '}
              {details.performance === 'error' && <span className="font-medium text-red-700 dark:text-red-300"> Performance degraded</span>}
              {' '}during alert period.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

