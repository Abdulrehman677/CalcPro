
import { useMemo, useState } from 'react';
import { BarChart3, RotateCcw, Calculator } from 'lucide-react';

export default function Statistics() {
  const [numbers, setNumbers] = useState('12, 18, 15, 20, 15, 10');
  const [sample, setSample] = useState(false);

  const values = useMemo(() => {
    return numbers
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map(Number);
  }, [numbers]);

  const valid = values.length > 0 && values.every(Number.isFinite);

  const stats = useMemo(() => {
    if (!valid) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = values.reduce((sum, value) => sum + value, 0) / n;
    const middle = Math.floor(n / 2);
    const median =
      n % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];

    const frequencies = new Map<number, number>();
    values.forEach(value =>
      frequencies.set(value, (frequencies.get(value) || 0) + 1)
    );

    const maxFrequency = Math.max(...frequencies.values());
    const modes =
      maxFrequency === 1
        ? []
        : [...frequencies.entries()]
            .filter(([, frequency]) => frequency === maxFrequency)
            .map(([value]) => value);

    const squaredDifferences = values.reduce(
      (sum, value) => sum + (value - mean) ** 2,
      0
    );

    const denominator = sample ? n - 1 : n;
    const variance =
      denominator > 0 ? squaredDifferences / denominator : 0;

    return {
      count: n,
      mean,
      median,
      mode: modes.length ? modes.join(', ') : 'No mode',
      minimum: sorted[0],
      maximum: sorted[n - 1],
      range: sorted[n - 1] - sorted[0],
      variance,
      standardDeviation: Math.sqrt(variance),
      sorted,
    };
  }, [values, valid, sample]);

  const format = (value: number) =>
    Number(value.toFixed(4)).toString();

  const resultCards = stats
    ? [
        { label: 'Mean', value: format(stats.mean) },
        { label: 'Median', value: format(stats.median) },
        { label: 'Mode', value: stats.mode },
        { label: 'Range', value: format(stats.range) },
        { label: 'Minimum', value: format(stats.minimum) },
        { label: 'Maximum', value: format(stats.maximum) },
        { label: 'Variance', value: format(stats.variance) },
        {
          label: 'Standard Deviation',
          value: format(stats.standardDeviation),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0b0b0b] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
            <BarChart3 className="h-7 w-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Statistics Calculator
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Analyze numerical data instantly.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <section className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Calculator className="h-5 w-5 text-amber-400" />
              Enter your data
            </h2>

            <label
              htmlFor="statistics-data"
              className="mb-2 block text-sm text-zinc-400"
            >
              Numbers separated by commas or spaces
            </label>

            <textarea
              id="statistics-data"
              value={numbers}
              onChange={event => setNumbers(event.target.value)}
              placeholder="Example: 10, 20, 30, 40, 50"
              rows={5}
              className="w-full resize-y rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none transition focus:border-amber-400"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={sample}
                  onChange={event => setSample(event.target.checked)}
                  className="accent-amber-400"
                />
                Sample variance
              </label>

              <button
                onClick={() => {
                  setNumbers('');
                  setSample(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-amber-400/50 hover:text-amber-300"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </button>
            </div>

            <p className="mt-4 text-xs leading-5 text-zinc-500">
              Population variance is used by default. Select Sample variance
              to divide by n − 1. Enter valid numbers only.
            </p>

            {!valid && numbers.trim() !== '' && (
              <p className="mt-3 text-sm text-red-400">
                Please enter valid numerical values separated by commas or spaces.
              </p>
            )}

            {valid && (
              <p className="mt-4 text-sm text-zinc-400">
                Total data points:{' '}
                <span className="font-semibold text-amber-400">
                  {stats?.count}
                </span>
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Analysis results</h2>

            {stats ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {resultCards.map(card => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-white/10 bg-[#141414] p-4 transition hover:border-amber-400/40"
                  >
                    <p className="text-sm text-zinc-400">{card.label}</p>
                    <p className="mt-2 break-words text-xl font-semibold text-amber-300">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-8 text-center text-zinc-400">
                Enter valid numbers to see the results.
              </div>
            )}

            {stats && (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#141414] p-5">
                <h3 className="mb-3 font-semibold">Sorted data</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.sorted.map((value, index) => (
                    <span
                      key={`${value}-${index}`}
                      className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-sm text-amber-200"
                    >
                      {format(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
