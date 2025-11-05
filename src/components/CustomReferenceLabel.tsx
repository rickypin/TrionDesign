import React from "react";

interface CustomReferenceLabelProps {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
  value: string;
  icon: 'line' | 'triangle';
  fill: string;
  metricValue?: number;
  metricUnit?: string;
}

export const CustomReferenceLabel: React.FC<CustomReferenceLabelProps> = ({
  viewBox,
  value,
  icon,
  fill,
  metricValue,
  metricUnit
}) => {
  if (!viewBox || viewBox.x === undefined || viewBox.y === undefined || viewBox.height === undefined) return null;

  const x = viewBox.x;

  // In Recharts coordinate system:
  // viewBox.y = top of the chart area
  // The 100% gridline is at viewBox.y
  // We need to place text and icon above this line
  const chartTop = viewBox.y;

  // Position elements above the 100% line
  const iconSize = 8;
  const iconCenterY = chartTop - 10; // Icon center 10px above the 100% line
  const textY = iconCenterY - 10; // Text baseline 10px above icon center

  // If metric value is provided, add extra space for the value text
  const hasMetricValue = metricValue !== undefined && metricUnit !== undefined;
  const valueTextY = hasMetricValue ? textY - 12 : textY; // Move label text up if showing value

  return (
    <g>
      {icon === 'line' ? (
        // Vertical line marker
        <line
          x1={x}
          y1={iconCenterY - iconSize / 2}
          x2={x}
          y2={iconCenterY + iconSize / 2}
          stroke={fill}
          strokeWidth={2}
        />
      ) : (
        // Downward triangle marker (pointing down)
        <polygon
          points={`${x},${iconCenterY + iconSize / 2} ${x - iconSize / 2},${iconCenterY - iconSize / 2} ${x + iconSize / 2},${iconCenterY - iconSize / 2}`}
          fill={fill}
        />
      )}
      {/* Label text */}
      <text
        x={x}
        y={valueTextY}
        textAnchor="middle"
        fill={fill}
        fontSize={11}
        fontWeight={600}
      >
        {value}
      </text>
      {/* Metric value text (if provided) */}
      {hasMetricValue && (
        <text
          x={x}
          y={textY}
          textAnchor="middle"
          fill={fill}
          fontSize={13}
          fontWeight={700}
        >
          {metricValue}{metricUnit}
        </text>
      )}
    </g>
  );
};

