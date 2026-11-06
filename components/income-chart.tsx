export type IncomePoint = { label: string; value: number }

const WIDTH = 720
const HEIGHT = 180
const PADDING = { top: 12, right: 8, bottom: 26, left: 8 }
const GAP = 10

/** Monthly income as a minimal bar chart (server-rendered, no chart library). */
export function IncomeChart({ points }: { points: IncomePoint[] }) {
  const max = Math.max(...points.map((point) => point.value), 1)
  const chartWidth = WIDTH - PADDING.left - PADDING.right
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom
  const barWidth = (chartWidth - GAP * (points.length - 1)) / points.length

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Invoiced per month"
      className="h-44 w-full"
    >
      {points.map((point, index) => {
        const x = PADDING.left + index * (barWidth + GAP)
        const height = Math.round((point.value / max) * chartHeight)
        const y = PADDING.top + chartHeight - height

        return (
          <g key={point.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={height}
              rx="2"
              className="fill-green-600"
            >
              <title>{`${point.label}: ${point.value.toLocaleString()}`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-gray-400 text-[10px]"
            >
              {point.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
