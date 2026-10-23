
import { useEffect, useRef, useState } from 'react'
import { all, create } from 'mathjs'
import { ChartNoAxesCombined, RotateCcw, Activity } from 'lucide-react'

const math = create(all, { number: 'number', precision: 14 })

type GraphValue = number | null

export default function Graphing() {
  const plotRef = useRef<HTMLDivElement>(null)
  const [formula, setFormula] = useState('sin(x)')
  const [minX, setMinX] = useState('-10')
  const [maxX, setMaxX] = useState('10')
  const [error, setError] = useState('')
  const [plotReady, setPlotReady] = useState(false)

  useEffect(() => {
    const element = plotRef.current
    if (!element) return

    let cancelled = false
    let plotInstance: any = null

    async function renderGraph() {
      const lower = Number(minX)
      const upper = Number(maxX)

      if (
        !formula.trim() ||
        !Number.isFinite(lower) ||
        !Number.isFinite(upper) ||
        lower >= upper ||
        upper - lower > 10000
      ) {
        setError('Enter a valid function and X range.')
        return
      }

      let compiledExpression

      try {
        compiledExpression = math.compile(formula)
      } catch {
        setError('Invalid function. Try sin(x), x^2, or cos(x).')
        return
      }

      const xValues: number[] = []
      const yValues: GraphValue[] = []
      const points = 500

      for (let i = 0; i <= points; i++) {
        const x = lower + ((upper - lower) * i) / points
        xValues.push(x)

        try {
          const value: unknown = compiledExpression.evaluate({ x })

          yValues.push(
            typeof value === 'number' &&
              Number.isFinite(value) &&
              Math.abs(value) < 1e10
              ? value
              : null,
          )
        } catch {
          yValues.push(null)
        }
      }

      try {
        const module = await import('plotly.js-basic-dist')
        const Plotly = module.default

        if (cancelled) return

        plotInstance = Plotly
        setError('')
        setPlotReady(true)

        await Plotly.react(
          element,
          [
            {
              x: xValues,
              y: yValues,
              type: 'scatter',
              mode: 'lines',
              name: `y = ${formula}`,
              line: {
                color: '#d8b46a',
                width: 2.5,
              },
              connectgaps: false,
              hovertemplate:
                'x = %{x:.4f}<br>y = %{y:.4f}<extra></extra>',
            },
          ],
          {
            paper_bgcolor: '#111110',
            plot_bgcolor: '#111110',
            font: {
              color: '#c7c1b3',
              family: 'Inter, Segoe UI, sans-serif',
            },
            margin: {
              l: 55,
              r: 20,
              t: 25,
              b: 50,
            },
            xaxis: {
              title: {
                text: 'X axis',
                font: { color: '#d8b46a' },
              },
              gridcolor: 'rgba(216,180,106,0.12)',
              zerolinecolor: 'rgba(216,180,106,0.45)',
              range: [lower, upper],
            },
            yaxis: {
              title: {
                text: 'Y axis',
                font: { color: '#d8b46a' },
              },
              gridcolor: 'rgba(216,180,106,0.12)',
              zerolinecolor: 'rgba(216,180,106,0.45)',
              autorange: true,
            },
            showlegend: false,
            autosize: true,
          },
          {
            responsive: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          },
        )
      } catch {
        if (!cancelled) {
          setError(
            'The graph could not be rendered. Check the function and try again.',
          )
        }
      }
    }

    void renderGraph()

    return () => {
      cancelled = true

      if (plotInstance) {
        plotInstance.purge(element)
      }
    }
  }, [formula, minX, maxX])

  function resetGraph() {
    setFormula('sin(x)')
    setMinX('-10')
    setMaxX('10')
    setError('')
  }

  return (
    <section style={{ display: 'grid', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="gold-icon">
          <ChartNoAxesCombined size={19} />
        </span>

        <div>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 500 }}>
            Function graphing
          </h2>

          <p
            style={{
              margin: '6px 0 0',
              color: 'var(--muted-text)',
              fontSize: 12,
            }}
          >
            Plot mathematical functions on a responsive coordinate plane.
          </p>
        </div>
      </header>

      <section className="side-card" style={{ display: 'grid', gap: 15 }}>
        <label style={{ display: 'grid', gap: 8, fontSize: 12 }}>
          Function y = f(x)

          <input
            value={formula}
            onChange={(event) => setFormula(event.target.value)}
            placeholder="Example: sin(x)"
            spellCheck={false}
            style={{
              width: '100%',
              minWidth: 0,
              padding: '12px 13px',
              border: '1px solid var(--line)',
              borderRadius: 8,
              background: 'var(--surface-soft)',
              color: 'var(--text)',
            }}
          />
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <label style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            Minimum X

            <input
              type="number"
              value={minX}
              onChange={(event) => setMinX(event.target.value)}
              style={{
                width: '100%',
                minWidth: 0,
                padding: 11,
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: 'var(--surface-soft)',
                color: 'var(--text)',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            Maximum X

            <input
              type="number"
              value={maxX}
              onChange={(event) => setMaxX(event.target.value)}
              style={{
                width: '100%',
                minWidth: 0,
                padding: 11,
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: 'var(--surface-soft)',
                color: 'var(--text)',
              }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'sin(x)', value: 'sin(x)' },
            { label: 'x²', value: 'x^2' },
            { label: 'cos(x)', value: 'cos(x)' },
            { label: 'Parabola', value: 'x^2 - 4' },
          ].map((preset) => (
            <button
              key={preset.label}
              className="mode-tab"
              onClick={() => setFormula(preset.value)}
            >
              {preset.label}
            </button>
          ))}

          <button className="mode-tab" onClick={resetGraph}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </section>

      <section className="calculator-card" style={{ padding: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 8px 14px',
            color: 'var(--muted-text)',
            fontSize: 11,
          }}
        >
          <Activity size={15} color="#d8b46a" />
          <span>y = {formula || '—'}</span>
        </div>

        {!plotReady && !error && (
          <p style={{ padding: 8, color: 'var(--muted-text)', fontSize: 12 }}>
            Loading graph...
          </p>
        )}

        <div
          ref={plotRef}
          style={{
            width: '100%',
            height: 390,
            minWidth: 0,
          }}
          aria-label="Interactive mathematical graph"
        />

        {error && (
          <p
            role="alert"
            style={{
              color: '#e3a18b',
              fontSize: 12,
              padding: 8,
            }}
          >
            {error}
          </p>
        )}
      </section>
    </section>
  )
}
