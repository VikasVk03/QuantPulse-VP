import type { MarketSeriesPoint } from "../../features/market/market.types";

interface PriceChartProps {
  series: MarketSeriesPoint[];
}

const WIDTH = 900;
const HEIGHT = 360;

const PADDING = {
  top: 30,
  right: 30,
  bottom: 45,
  left: 65,
};

export function PriceChart({ series }: PriceChartProps) {
  if (series.length === 0) {
    return <div className="chart-empty">No price observations available.</div>;
  }

  const prices = series.map((point) => point.price);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const priceRange = maxPrice - minPrice || 1;

  const chartWidth = WIDTH - PADDING.left - PADDING.right;

  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const getX = (index: number) => {
    if (series.length === 1) {
      return PADDING.left;
    }

    return PADDING.left + (index / (series.length - 1)) * chartWidth;
  };

  const getY = (price: number) => {
    return PADDING.top + ((maxPrice - price) / priceRange) * chartHeight;
  };

  const points = series
    .map((point, index) => `${getX(index)},${getY(point.price)}`)
    .join(" ");

  const areaPoints = [
    `${getX(0)},${HEIGHT - PADDING.bottom}`,
    points,
    `${getX(series.length - 1)},${HEIGHT - PADDING.bottom}`,
  ].join(" ");

  const yTicks = 5;

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h2>Price Trend</h2>
          <span>Close price observations</span>
        </div>

        <div className="chart-legend">
          <span className="legend-dot" />
          Close Price
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="price-chart"
        role="img"
        aria-label="Market price chart"
      >
        {Array.from({ length: yTicks }, (_, index) => {
          const ratio = index / (yTicks - 1);

          const price = maxPrice - ratio * priceRange;

          const y = PADDING.top + ratio * chartHeight;

          return (
            <g key={index}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                className="grid-line"
              />

              <text
                x={PADDING.left - 10}
                y={y + 4}
                textAnchor="end"
                className="axis-label"
              >
                {price.toFixed(2)}
              </text>
            </g>
          );
        })}

        <polygon points={areaPoints} className="chart-area" />

        <polyline points={points} fill="none" className="chart-line" />

        {series.map((point, index) => (
          <circle
            key={`${point.timestamp}-${index}`}
            cx={getX(index)}
            cy={getY(point.price)}
            r="4"
            className="chart-point"
          >
            <title>{point.price.toFixed(2)}</title>
          </circle>
        ))}

        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={HEIGHT - PADDING.bottom}
          y2={HEIGHT - PADDING.bottom}
          className="axis-line"
        />
      </svg>
    </div>
  );
}
