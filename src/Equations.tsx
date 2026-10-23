
import { useState } from 'react';
import { Calculator, RotateCcw, Sigma } from 'lucide-react';

export default function Equations() {
  const [equationType, setEquationType] = useState<'linear' | 'quadratic'>('linear');
  const [a, setA] = useState('2');
  const [b, setB] = useState('6');
  const [c, setC] = useState('0');
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState('');

  function solveEquation() {
    setError('');
    setResult([]);

    const A = Number(a);
    const B = Number(b);
    const C = Number(c);

    if (
      a.trim() === '' ||
      b.trim() === '' ||
      (equationType === 'quadratic' && c.trim() === '') ||
      ![A, B, C].every(Number.isFinite)
    ) {
      setError('Please enter valid numbers.');
      return;
    }

    if (equationType === 'linear') {
      if (A === 0) {
        setError('The coefficient of x cannot be zero.');
        return;
      }

      setResult([`x = ${-B / A}`]);
      return;
    }

    if (A === 0) {
      setError('For a quadratic equation, a cannot be zero.');
      return;
    }

    const discriminant = B * B - 4 * A * C;

    if (discriminant > 0) {
      const x1 = (-B + Math.sqrt(discriminant)) / (2 * A);
      const x2 = (-B - Math.sqrt(discriminant)) / (2 * A);

      setResult([`x₁ = ${x1}`, `x₂ = ${x2}`]);
    } else if (discriminant === 0) {
      setResult([`x = ${-B / (2 * A)}`]);
    } else {
      const real = -B / (2 * A);
      const imaginary = Math.sqrt(-discriminant) / (2 * A);

      setResult([
        `x₁ = ${real} + ${Math.abs(imaginary)}i`,
        `x₂ = ${real} - ${Math.abs(imaginary)}i`,
      ]);
    }
  }

  function resetForm() {
    setA('2');
    setB('6');
    setC('0');
    setResult([]);
    setError('');
  }

  function changeEquationType(type: 'linear' | 'quadratic') {
    setEquationType(type);
    setResult([]);
    setError('');
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-300">
            <Sigma size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Equations Solver
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Solve linear and quadratic equations instantly.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 md:p-7">
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Equation Type
        </label>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => changeEquationType('linear')}
            className={`rounded-xl border px-4 py-3 font-medium transition ${
              equationType === 'linear'
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-white/10 text-zinc-400 hover:border-white/30'
            }`}
          >
            Linear Equation
          </button>

          <button
            type="button"
            onClick={() => changeEquationType('quadratic')}
            className={`rounded-xl border px-4 py-3 font-medium transition ${
              equationType === 'quadratic'
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-white/10 text-zinc-400 hover:border-white/30'
            }`}
          >
            Quadratic Equation
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-black/30 p-4 text-center">
          <p className="text-sm text-zinc-400">Your equation</p>

          <p className="mt-2 text-xl font-semibold text-amber-300 md:text-2xl">
            {equationType === 'linear'
              ? `${a || '0'}x + (${b || '0'}) = 0`
              : `${a || '0'}x² + (${b || '0'})x + (${c || '0'}) = 0`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Coefficient a
            </label>

            <input
              type="number"
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Coefficient b
            </label>

            <input
              type="number"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400"
            />
          </div>

          {equationType === 'quadratic' && (
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Coefficient c
              </label>

              <input
                type="number"
                value={c}
                onChange={(e) => setC(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={solveEquation}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300"
          >
            <Calculator size={18} />
            Solve Equation
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-zinc-300 transition hover:bg-white/5"
          >
            <RotateCcw size={17} />
            Reset
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {result.length > 0 && (
          <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
            <h2 className="mb-3 font-semibold text-amber-300">Solution</h2>

            {result.map((answer, index) => (
              <p key={index} className="py-1 text-lg text-white">
                {answer}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
