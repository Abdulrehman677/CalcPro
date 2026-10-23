
import { useState } from 'react';
import { Atom, RotateCcw, Calculator } from 'lucide-react';

type Matrix = number[][];

function parseMatrix(value: string): Matrix | null {
  const input = value.trim();

  if (!input) return null;

  const rows = input.split('\n').map((row) => {
    const trimmedRow = row.trim();

    if (!trimmedRow) return [];

    return trimmedRow.split(/[\s,]+/).map(Number);
  });

  if (
    rows.some((row) => row.length === 0) ||
    rows.some((row) => row.length !== rows[0].length) ||
    rows.some((row) => row.some((number) => !Number.isFinite(number)))
  ) {
    return null;
  }

  return rows;
}

function formatMatrix(matrix: Matrix): string {
  return matrix.map((row) => row.join('   ')).join('\n');
}

export default function Matrices() {
  const [matrixA, setMatrixA] = useState('1 2\n3 4');
  const [matrixB, setMatrixB] = useState('5 6\n7 8');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState<Matrix | null>(null);
  const [error, setError] = useState('');

  function calculate() {
    setError('');
    setResult(null);

    const A = parseMatrix(matrixA);
    const B = parseMatrix(matrixB);

    if (!A || !B) {
      setError(
        'Enter valid numbers in each matrix. Use one row per line.',
      );
      return;
    }

    if (operation !== 'multiply') {
      if (A.length !== B.length || A[0].length !== B[0].length) {
        setError(
          'Addition and subtraction require matrices of the same size.',
        );
        return;
      }

      const output = A.map((row, i) =>
        row.map((value, j) =>
          operation === 'add' ? value + B[i][j] : value - B[i][j],
        ),
      );

      setResult(output);
      return;
    }

    if (A[0].length !== B.length) {
      setError('Columns of Matrix A must equal rows of Matrix B.');
      return;
    }

    const output = A.map((row) =>
      B[0].map((_, j) =>
        row.reduce((sum, value, k) => sum + value * B[k][j], 0),
      ),
    );

    setResult(output);
  }

  function reset() {
    setMatrixA('1 2\n3 4');
    setMatrixB('5 6\n7 8');
    setOperation('add');
    setResult(null);
    setError('');
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-300">
          <Atom size={25} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Matrix Solver
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Perform matrix addition, subtraction and multiplication.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 md:p-7">
        <label
          htmlFor="matrix-operation"
          className="mb-2 block text-sm text-zinc-300"
        >
          Select operation
        </label>

        <select
          id="matrix-operation"
          value={operation}
          onChange={(e) => {
            setOperation(e.target.value);
            setResult(null);
            setError('');
          }}
          className="mb-6 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-400"
        >
          <option value="add">Matrix Addition (A + B)</option>
          <option value="subtract">Matrix Subtraction (A − B)</option>
          <option value="multiply">Matrix Multiplication (A × B)</option>
        </select>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="matrix-a"
              className="mb-2 block font-medium text-amber-300"
            >
              Matrix A
            </label>

            <textarea
              id="matrix-a"
              value={matrixA}
              onChange={(e) => setMatrixA(e.target.value)}
              rows={5}
              spellCheck={false}
              placeholder={'1 2\n3 4'}
              className="w-full rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-white outline-none focus:border-amber-400"
            />

            <p className="mt-2 text-xs text-zinc-500">
              Enter one row per line; separate numbers with spaces or commas.
            </p>
          </div>

          <div>
            <label
              htmlFor="matrix-b"
              className="mb-2 block font-medium text-amber-300"
            >
              Matrix B
            </label>

            <textarea
              id="matrix-b"
              value={matrixB}
              onChange={(e) => setMatrixB(e.target.value)}
              rows={5}
              spellCheck={false}
              placeholder={'5 6\n7 8'}
              className="w-full rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-white outline-none focus:border-amber-400"
            />

            <p className="mt-2 text-xs text-zinc-500">
              Make sure the dimensions match the selected operation.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={calculate}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300"
          >
            <Calculator size={18} />
            Calculate
          </button>

          <button
            type="button"
            onClick={reset}
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

        {result && (
          <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
            <h2 className="mb-4 font-semibold text-amber-300">
              Result Matrix
            </h2>

            <pre className="overflow-x-auto whitespace-pre rounded-lg bg-black/30 p-4 font-mono text-lg leading-8 text-white">
              {formatMatrix(result)}
            </pre>

            <p className="mt-3 text-xs text-zinc-500">
              Dimensions: {result.length} × {result[0].length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
