
import { lazy, Suspense, useEffect, useState } from 'react';
import { all, create } from 'mathjs';
import {
  Activity,
  Atom,
  Calculator as CalculatorIcon,
  ChartNoAxesCombined,
  Clock3,
  Command,
  Copy,
  Delete,
  History,
  Keyboard,
  Moon,
  RotateCcw,
  Settings2,
  Sigma,
  Sparkles,
  SquareFunction,
  Sun,
} from 'lucide-react';

const Graphing = lazy(() => import('./Graphing'));
const Equations = lazy(() => import('./Equations'));
const Matrices = lazy(() => import('./Matrices'));
const Statistics = lazy(() => import('./Statistics'));

const math = create(all, {
  number: 'number',
  precision: 14,
});

type HistoryItem = {
  expression: string;
  result: string;
};

const STORAGE_KEY = 'calcpro-history';

const keys = [
  ['AC', '(', ')', '⌫'],
  ['sin', 'cos', 'tan', '÷'],
  ['ln', 'log', '√', '×'],
  ['x²', 'xʸ', 'π', '−'],
  ['7', '8', '9', '+'],
  ['4', '5', '6', '%'],
  ['1', '2', '3', '='],
  ['±', '0', '.', '='],
];

const initialHistory: HistoryItem[] = [
  { expression: 'sin(30°) + cos(60°)', result: '1' },
  { expression: 'sqrt(144) + 8^2', result: '76' },
  { expression: 'log(1000)', result: '3' },
];

const navItems = [
  { label: 'Calculator', icon: CalculatorIcon },
  { label: 'Graphing', icon: ChartNoAxesCombined },
  { label: 'Equations', icon: SquareFunction },
  { label: 'Matrices', icon: Atom },
  { label: 'Statistics', icon: Sigma },
];

function formatResult(value: unknown): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Result is outside the supported range.');
    }

    if (Object.is(value, -0)) return '0';

    return Number(value.toPrecision(12)).toString();
  }

  if (typeof value === 'boolean' || typeof value === 'string') {
    return String(value);
  }

  return math.format(value as never, { precision: 12 });
}

function evaluateExpression(expression: string, angleMode: 'DEG' | 'RAD') {
  const prepared = expression
    .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)')
    .replace(/(\d|\))\s+(?=(pi|e|sqrt|sin|cos|tan|log|abs)\b)/g, '$1*')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√\(/g, 'sqrt(')
    .replace(/\bln\(/g, 'log(')
    .replace(/\blog\(/g, 'log10(');

  let nodeExpression = prepared;

  if (angleMode === 'DEG') {
    nodeExpression = nodeExpression.replace(
      /\b(sin|cos|tan)\(([^()]*)\)/g,
      (_, fn: string, argument: string) =>
        `${fn}((${argument}) * pi / 180)`,
    );
  }

  const scope = {
    sin: math.sin,
    cos: math.cos,
    tan: math.tan,
    asin: math.asin,
    acos: math.acos,
    atan: math.atan,
    sqrt: math.sqrt,
    log: math.log,
    log10: math.log10,
    abs: math.abs,
    pi: math.pi,
    e: math.e,
  };

  return formatResult(math.evaluate(nodeExpression, scope));
}

function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as HistoryItem[]) : initialHistory;
    } catch {
      return initialHistory;
    }
  });

  const [activeMode, setActiveMode] = useState('Calculator');
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [memory, setMemory] = useState<number | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // History remains available during this session.
    }
  }, [history]);

  function calculate() {
    if (!expression.trim()) return;

    try {
      const answer = evaluateExpression(expression, angleMode);
      setResult(answer);
      setError('');

      setHistory((current) =>
        [
          { expression, result: answer },
          ...current.filter(
            (item) => item.expression !== expression || item.result !== answer,
          ),
        ].slice(0, 100),
      );
    } catch {
      setError('Invalid expression. Check your input and try again.');
    }
  }

  function pressKey(key: string) {
    if (key === 'AC') {
      setExpression('');
      setResult('0');
      setError('');
      return;
    }

    if (key === '⌫') {
      setExpression((current) => current.slice(0, -1));
      setError('');
      return;
    }

    if (key === '=') {
      calculate();
      return;
    }

    const symbols: Record<string, string> = {
      '×': '*',
      '÷': '/',
      '−': '-',
      'π': 'pi',
      '√': 'sqrt(',
      'x²': '^2',
      'xʸ': '^',
      '±': '-',
    };

    setExpression((current) => {
      if (['sin', 'cos', 'tan', 'ln', 'log'].includes(key)) {
        return current + key + '(';
      }

      if (key === '±') {
        return current.startsWith('-') ? current.slice(1) : '-' + current;
      }

      return current + (symbols[key] ?? key);
    });

    setError('');
  }

  function selectHistory(item: HistoryItem) {
    setExpression(item.expression);
    setResult(item.result);
    setError('');
    setActiveMode('Calculator');
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Clipboard access is unavailable in this browser.');
    }
  }

  function addConstant(value: string) {
    setExpression((current) => current + value);
  }

  function storeMemory() {
    const numericResult = Number(result);
    if (Number.isFinite(numericResult)) setMemory(numericResult);
  }

  function recallMemory() {
    if (memory !== null) addConstant(String(memory));
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      if (/^[0-9.]$/.test(event.key)) {
        event.preventDefault();
        pressKey(event.key);
      } else if (['+', '-', '*', '/', '^', '(', ')', '%'].includes(event.key)) {
        event.preventDefault();
        pressKey(
          event.key === '*' ? '×' :
          event.key === '/' ? '÷' :
          event.key === '-' ? '−' : event.key,
        );
      } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        pressKey('=');
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        pressKey('⌫');
      } else if (event.key === 'Escape') {
        pressKey('AC');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function renderHistory(full = false) {
    return (
      <section className="side-card history-card">
        <div className="side-card-heading">
          <div>
            <span className="mini-gold-icon">
              <Clock3 size={16} />
            </span>
            <strong>{full ? 'Calculation history' : 'Recent history'}</strong>
          </div>
          <button onClick={() => setHistory([])}>Clear {full ? 'history' : ''}</button>
        </div>

        <p className="side-card-subtitle">
          {full
            ? 'Select a calculation to load it back into the calculator.'
            : 'Your calculations, in one place.'}
        </p>

        {history.length === 0 ? (
          <div className="empty-history">
            <History size={25} />
            <strong>No history yet</strong>
            <span>Your calculations will appear here.</span>
          </div>
        ) : (
          <div className="history-list">
            {(full ? history : history.slice(0, 5)).map((item, index) => (
              <button
                className="history-item"
                key={`${item.expression}-${index}`}
                onClick={() => selectHistory(item)}
              >
                <span>{item.expression}</span>
                <strong>= {item.result}</strong>
              </button>
            ))}
          </div>
        )}

        {!full && (
          <button
            className="history-link"
            onClick={() => setActiveMode('History')}
          >
            View all history <span>↗</span>
          </button>
        )}
      </section>
    );
  }

  return (
    <main className={`app-shell ${darkMode ? '' : 'light-theme'}`}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          aria-label="CalcPro home"
          onClick={(event) => {
            event.preventDefault();
            setActiveMode('Calculator');
          }}
        >
          <span className="brand-mark">
            <CalculatorIcon size={22} />
          </span>
          <span>
            <strong>CALCPRO</strong>
            <small>PRECISION STUDIO</small>
          </span>
        </a>

        <div className="side-label">WORKSPACE</div>

        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeMode === label ? 'active' : ''}`}
              onClick={() => setActiveMode(label)}
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{label}</span>
              {label === 'Calculator' && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="side-label tools-label">YOUR TOOLS</div>

        <button
          className={`nav-item ${activeMode === 'History' ? 'active' : ''}`}
          onClick={() => setActiveMode('History')}
        >
          <History size={18} strokeWidth={1.7} />
          <span>History</span>
        </button>

        <button
          className={`nav-item ${activeMode === 'Settings' ? 'active' : ''}`}
          onClick={() => setActiveMode('Settings')}
        >
          <Settings2 size={18} strokeWidth={1.7} />
          <span>Preferences</span>
        </button>

        <div className="sidebar-bottom">
          <div className="precision-card">
            <Sparkles size={17} />
            <strong>Precision mode</strong>
            <p>Built for serious calculations.</p>
            <span className="status-line"><span /> Engine workspace</span>
          </div>

          <div className="profile-row">
            <div className="profile-avatar">CP</div>
            <div>
              <strong>CalcPro</strong>
              <small>Personal workspace</small>
            </div>
            <Settings2 size={16} className="profile-settings" />
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{activeMode}</strong>
          </div>

          <div className="top-actions">
            <span className="engine-status">
              <span /> READY TO CALCULATE
            </span>

            <button
              className="icon-button"
              aria-label="Toggle theme"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="avatar-small" aria-label="Workspace profile">
              C
            </button>
          </div>
        </header>

        <div className="workspace-content">
          <Suspense
            fallback={
              <div className="side-card p-8 text-center text-zinc-400">
                Loading workspace...
              </div>
            }
          >
            {activeMode === 'Graphing' ? (
              <Graphing />
            ) : activeMode === 'Equations' ? (
              <Equations />
            ) : activeMode === 'Matrices' ? (
              <Matrices />
            ) : activeMode === 'Statistics' ? (
              <Statistics />
            ) : activeMode === 'History' ? (
              renderHistory(true)
            ) : activeMode === 'Settings' ? (
              <section className="side-card">
                <div className="side-card-heading">
                  <div>
                    <span className="mini-gold-icon">
                      <Settings2 size={16} />
                    </span>
                    <strong>Preferences</strong>
                  </div>
                </div>

                <p className="side-card-subtitle">
                  Customize your CalcPro workspace.
                </p>

                <div className="history-list">
                  <div className="history-item">
                    <span>Appearance</span>
                    <button onClick={() => setDarkMode(!darkMode)}>
                      {darkMode ? 'Dark theme' : 'Light theme'}
                    </button>
                  </div>
                  <div className="history-item">
                    <span>Angle mode</span>
                    <button
                      onClick={() =>
                        setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')
                      }
                    >
                      {angleMode}
                    </button>
                  </div>
                  <div className="history-item">
                    <span>Calculation history</span>
                    <button onClick={() => setHistory([])}>Clear history</button>
                  </div>
                </div>
              </section>
            ) : (
              <>
                <div className="page-heading">
                  <div>
                    <div className="eyebrow">
                      <span /> THE ART OF PRECISION
                    </div>
                    <h1>
                      Calculate with <span>clarity.</span>
                    </h1>
                    <p>A refined workspace for every mathematical challenge.</p>
                  </div>

                  <div className="heading-badge">
                    <Activity size={16} /> ADVANCED WORKSPACE
                  </div>
                </div>

                <div className="mode-tabs" role="tablist" aria-label="Calculator modes">
                  {['Standard', 'Scientific', 'Programmer'].map((mode) => (
                    <button
                      key={mode}
                      role="tab"
                      aria-selected={mode === 'Standard'}
                      className={`mode-tab ${mode === 'Standard' ? 'selected' : ''}`}
                      onClick={() => setActiveMode('Calculator')}
                    >
                      {mode}
                    </button>
                  ))}

                  <div className="mode-spacer" />

                  <button
                    className="angle-toggle"
                    onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
                  >
                    <span className={angleMode === 'DEG' ? 'angle-active' : ''}>
                      DEG
                    </span>
                    <span className={angleMode === 'RAD' ? 'angle-active' : ''}>
                      RAD
                    </span>
                  </button>
                </div>

                <div className="dashboard-grid">
                  <section className="calculator-card">
                    <div className="card-topline">
                      <div className="card-title">
                        <span className="gold-icon">
                          <CalculatorIcon size={17} />
                        </span>
                        <span>
                          Scientific calculator
                          <small>HIGH PRECISION MODE</small>
                        </span>
                      </div>

                      <button
                        className="subtle-icon"
                        aria-label="Reset calculator"
                        onClick={() => pressKey('AC')}
                      >
                        <RotateCcw size={17} />
                      </button>
                    </div>

                    <div className="display-panel">
                      <div className="display-meta">
                        <span>EXPRESSION</span>
                        <span>{angleMode} MODE</span>
                      </div>

                      <div className="expression-line">
                        {expression || 'Enter an expression'}
                      </div>

                      <div className="result-line">
                        <span>=</span>
                        <strong>{result}</strong>
                      </div>

                      {error && (
                        <p role="alert" style={{ color: '#e3a18b', fontSize: 11 }}>
                          {error}
                        </p>
                      )}

                      <div className="display-bottom">
                        <span>
                          <span className="live-dot" /> LIVE DISPLAY
                        </span>
                        <div>
                          <button aria-label="Copy result" onClick={copyResult}>
                            <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
                          </button>
                          <button
                            aria-label="Keyboard shortcuts"
                            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                          >
                            <Keyboard size={14} /> Keyboard
                          </button>
                        </div>
                      </div>
                    </div>

                    {showKeyboardHelp && (
                      <div
                        className="side-card"
                        style={{ marginBottom: 15, fontSize: 11, lineHeight: 1.8 }}
                      >
                        <strong>Keyboard shortcuts</strong>
                        <p>Numbers and operators: type directly</p>
                        <p>Enter or =: calculate</p>
                        <p>Backspace: delete last character</p>
                        <p>Escape: clear expression</p>
                      </div>
                    )}

                    <div className="keypad">
                      {keys.flat().map((key, index) => (
                        <button
                          key={`${key}-${index}`}
                          className={[
                            'calc-key',
                            [
                              'AC', '(', ')', '⌫', 'sin', 'cos', 'tan', 'ln',
                              'log', '√', 'x²', 'xʸ', 'π', '±', '%',
                            ].includes(key) ? 'function-key' : '',
                            ['÷', '×', '−', '+'].includes(key) ? 'operator-key' : '',
                            key === '=' ? 'equals-key' : '',
                            key === 'AC' ? 'clear-key' : '',
                          ].join(' ')}
                          onClick={() => pressKey(key)}
                        >
                          {key === '⌫' ? <Delete size={18} /> : key}
                        </button>
                      ))}
                    </div>

                    <div className="calculator-footer">
                      <span>
                        <Command size={13} /> Keyboard input supported
                      </span>
                      <span>
                        CALCPRO <span className="footer-gold">PRECISION</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="mode-tab" onClick={storeMemory}>MS</button>
                      <button className="mode-tab" onClick={recallMemory}>MR</button>
                      <button className="mode-tab" onClick={() => setMemory(null)}>MC</button>
                      <span
                        style={{
                          alignSelf: 'center',
                          color: 'var(--muted-text)',
                          fontSize: 10,
                        }}
                      >
                        {memory === null ? 'Memory empty' : `Memory: ${memory}`}
                      </span>
                    </div>
                  </section>

                  <aside className="right-column">
                    {renderHistory()}

                    <section className="side-card quick-card">
                      <div className="side-card-heading">
                        <div>
                          <span className="mini-gold-icon">
                            <Sparkles size={16} />
                          </span>
                          <strong>Quick functions</strong>
                        </div>
                      </div>

                      <p className="side-card-subtitle">
                        Useful constants at your fingertips.
                      </p>

                      <div className="quick-functions">
                        <button onClick={() => addConstant('pi')}>
                          <span>π</span>
                          <div>
                            <strong>Pi</strong>
                            <small>3.14159265...</small>
                          </div>
                          <span className="quick-plus">+</span>
                        </button>

                        <button onClick={() => addConstant('e')}>
                          <span>e</span>
                          <div>
                            <strong>Euler's number</strong>
                            <small>2.71828182...</small>
                          </div>
                          <span className="quick-plus">+</span>
                        </button>
                      </div>
                    </section>

                    <section className="insight-card">
                      <div className="insight-icon">
                        <Sparkles size={18} />
                      </div>
                      <div className="insight-tag">DESIGNED FOR PRECISION</div>
                      <h3>
                        Every detail,<br /><span>considered.</span>
                      </h3>
                      <p>
                        A focused space where complex mathematics feels effortless.
                      </p>
                      <div className="insight-line" />
                      <div className="insight-bottom">
                        <span>CALCPRO STUDIO</span>
                        <span>01 — 06</span>
                      </div>
                    </section>
                  </aside>
                </div>
              </>
            )}
          </Suspense>

          <footer className="page-footer">
            <span>© 2026 CALCPRO STUDIO</span>
            <span>
              <span className="footer-status" /> LOCAL WORKSPACE
              <span className="footer-separator">•</span> PRIVATE BY DESIGN
            </span>
            <span>CRAFTED FOR CLARITY</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default App;
