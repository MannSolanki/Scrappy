import { useEffect, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { FiPieChart, FiTrendingUp } from 'react-icons/fi';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { WasteDistributionDataPoint } from '../types';

interface WasteDistributionChartProps {
  data?: WasteDistributionDataPoint[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  centerLabel?: string;
  valueSuffix?: string;
  emptyMessage?: string;
}

interface ChartDatum extends WasteDistributionDataPoint {
  color: string;
  percentage: number;
}

const CHART_COLORS: Record<string, string> = {
  plastic: '#22c55e',
  paper: '#facc15',
  metal: '#38bdf8',
  glass: '#fb923c',
  others: '#94a3b8',
};

const formatValue = (value: number, suffix?: string): string => {
  const numericValue = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return suffix ? `${numericValue} ${suffix}` : numericValue;
};

const formatPercentage = (value: number): string =>
  `${value >= 10 || Number.isInteger(value) ? Math.round(value) : value.toFixed(1)}%`;

function WasteDistributionTooltip({
  active,
  payload,
  valueSuffix,
}: TooltipProps<ValueType, NameType> & { valueSuffix?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload as ChartDatum | undefined;

  if (!item) {
    return null;
  }

  return (
    <div className="admin-donut-tooltip">
      <div className="admin-donut-tooltip-title">
        <span
          className="admin-donut-tooltip-swatch"
          style={{ backgroundColor: item.color }}
          aria-hidden="true"
        />
        <strong>{item.name}</strong>
      </div>
      <p>{formatValue(item.value, valueSuffix)}</p>
      <span>{formatPercentage(item.percentage)} of total waste</span>
    </div>
  );
}

function WasteDistributionChart({
  data = [],
  isLoading = false,
  title = 'Waste Distribution',
  subtitle = 'Category share across collected waste',
  centerLabel = 'Total Waste',
  valueSuffix = 'kg',
  emptyMessage = 'No waste distribution data available yet.',
}: WasteDistributionChartProps) {
  const normalizedData = useMemo(
    () =>
      data
        .filter((item) => Number.isFinite(item.value) && item.value >= 0)
        .map((item) => ({
          ...item,
          color: item.color || CHART_COLORS[item.name.toLowerCase()] || '#bbf7d0',
        })),
    [data]
  );

  const totalValue = useMemo(
    () => normalizedData.reduce((sum, item) => sum + item.value, 0),
    [normalizedData]
  );

  const chartData = useMemo<ChartDatum[]>(
    () =>
      normalizedData.map((item) => ({
        ...item,
        percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
      })),
    [normalizedData, totalValue]
  );

  const topWaste = useMemo(
    () =>
      chartData.reduce<ChartDatum | null>((largest, item) => {
        if (!largest || item.value > largest.value) {
          return item;
        }

        return largest;
      }, null),
    [chartData]
  );

  const topWasteIndex = useMemo(
    () => (topWaste ? chartData.findIndex((item) => item.name === topWaste.name) : -1),
    [chartData, topWaste]
  );

  const [activeIndex, setActiveIndex] = useState<number>(topWasteIndex >= 0 ? topWasteIndex : 0);

  useEffect(() => {
    setActiveIndex(topWasteIndex >= 0 ? topWasteIndex : 0);
  }, [topWasteIndex]);

  const activeItem = chartData[activeIndex] || topWaste || null;
  const hasData = totalValue > 0;

  return (
    <Card className="admin-table-card admin-chart-card admin-donut-card">
      <Card.Header className="admin-table-header admin-chart-header admin-donut-header">
        <div className="admin-donut-header-copy">
          <div className="admin-donut-title-block">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {topWaste ? (
            <div className="admin-donut-highlight" aria-label="Top waste type">
              <span className="admin-donut-highlight-label">
                <FiTrendingUp size={14} />
                Most Sold
              </span>
              <strong>
                {topWaste.name} ({formatPercentage(topWaste.percentage)})
              </strong>
            </div>
          ) : null}
        </div>
      </Card.Header>

      <Card.Body className="admin-chart-body admin-donut-body">
        {isLoading ? (
          <div className="admin-donut-loading" aria-live="polite" aria-busy="true">
            <div className="admin-donut-skeleton-ring" />
            <div className="admin-donut-skeleton-legend">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={`waste-skeleton-${index}`} />
              ))}
            </div>
          </div>
        ) : !hasData ? (
          <div className="admin-donut-empty" role="status">
            <span className="admin-donut-empty-icon" aria-hidden="true">
              <FiPieChart size={26} />
            </span>
            <h3>No category data</h3>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="admin-donut-layout">
            <div className="admin-donut-visual-panel">
              <div className="admin-donut-chart-wrap">
                <div
                  className="admin-donut-chart-glow"
                  style={{ backgroundColor: activeItem?.color || '#22c55e' }}
                  aria-hidden="true"
                />
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={84}
                      outerRadius={126}
                      paddingAngle={2}
                      cornerRadius={10}
                      stroke="rgba(255, 255, 255, 0.96)"
                      strokeWidth={4}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(topWasteIndex >= 0 ? topWasteIndex : 0)}
                      isAnimationActive
                      animationDuration={1100}
                      animationEasing="ease-out"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          fillOpacity={activeIndex === index ? 1 : 0.88}
                          style={{
                            filter: activeIndex === index ? `drop-shadow(0 12px 22px ${entry.color}2e)` : 'none',
                            transform: activeIndex === index ? 'scale(1.01)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'fill-opacity 0.28s ease, filter 0.28s ease, transform 0.28s ease',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      content={<WasteDistributionTooltip valueSuffix={valueSuffix} />}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="admin-donut-center">
                  <span>{centerLabel}</span>
                  <strong>{formatValue(totalValue, valueSuffix)}</strong>
                </div>
              </div>

              {activeItem ? (
                <div className="admin-donut-hover-note">
                  <span
                    className="admin-donut-hover-dot"
                    style={{ backgroundColor: activeItem.color }}
                    aria-hidden="true"
                  />
                  <p>
                    {activeItem.name} contributes {formatPercentage(activeItem.percentage)} of the total waste.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="admin-donut-legend-panel">
              <div className="admin-donut-legend" aria-label="Waste distribution legend">
                {chartData.map((entry) => (
                  <div key={entry.name} className="admin-donut-legend-item">
                    <div className="admin-donut-legend-main">
                      <span
                        className="admin-donut-legend-swatch"
                        style={{ backgroundColor: entry.color }}
                        aria-hidden="true"
                      />
                      <div className="admin-donut-legend-copy">
                        <strong>{entry.name}</strong>
                        <span>{formatValue(entry.value, valueSuffix)}</span>
                      </div>
                    </div>
                    <div className="admin-donut-legend-meta">
                      <em>{formatPercentage(entry.percentage)}</em>
                      <div className="admin-donut-legend-bar" aria-hidden="true">
                        <span
                          style={{
                            width: `${Math.max(entry.percentage, entry.value > 0 ? 6 : 0)}%`,
                            backgroundColor: entry.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default WasteDistributionChart;
