import { useState } from 'react';
import { Delete, RefreshCw, Sparkles } from 'lucide-react';

interface CalculationRequest {
  a: number;
  b: number;
}

interface CalculationResponse {
  result: number;
  error: string;
}

export default function App() {
  const [equation, setEquation] = useState<string>('');
  const [display, setDisplay] = useState<string>('0');
  const [operand1, setOperand1] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [operand2, setOperand2] = useState<number | null>(null);
  const [waitingForOperand2, setWaitingForOperand2] = useState<boolean>(false);
  const [history, setHistory] = useState<string>();

  const sendRequest = async (a : number, b : number | null, operation : string) => {
    try {
    const response = await fetch("http://localhost:8080/calculate/" + operation, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({a, b}),
    });
    if (!response.ok) {
      return "Error";
    }

    const data : CalculationResponse = await response.json();
      return data.result;
    } catch (error) {
      return "Error"
    }
  }

  const handleNumber = (num: string) => {
    if (waitingForOperand2) {
      setDisplay(num);
      setWaitingForOperand2(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand2) {
      setDisplay('0.');
      setWaitingForOperand2(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (nextOperator: string, operatorSymbol: string) => {
    const inputValue = parseFloat(display);

    setEquation(inputValue + operatorSymbol);
    setOperand1(inputValue);
    setDisplay(nextOperator === "div" ? "1" : "0");
    setWaitingForOperand2(true);
    setOperator(nextOperator);
  };

  const handleSquareRoot = async () => {
    const val = parseFloat(display);
    const result = await sendRequest(val, null, "sqr");
    setEquation("");
    setDisplay(String(result));
    setHistory(`√(${val}) = ${result}`);
    setOperand1(typeof(result) === "number" ? result : 0);
    setWaitingForOperand2(true);
  };

  const handlePercentage = async () => {
    const val = parseFloat(display);
    const result = await sendRequest(val, null, "per");
    setEquation("");
    setDisplay(String(result));
    setHistory(`${val}% = ${result}`);
    setOperand1(typeof(result) === "number" ? result : 0);
    setWaitingForOperand2(true);
  };

  const handleClear = () => {
    setEquation("");
    setHistory("");
    setDisplay('0');
    setOperand1(null);
    setOperator(null);
    setOperand2(null);
    setWaitingForOperand2(false);
  };

  const handleBackspace = () => {
    if (display.length > 1 && !waitingForOperand2) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCalculate = async () => {
    const inputValue = parseFloat(display);
    
    if (operator && operand1 !== null) {
      const currentOperand2 = inputValue;
      setOperand2(currentOperand2);
      
      const result = await sendRequest(operand1, currentOperand2, operator);
      
      if (result === "Error") {
        setDisplay("Error");
      } else {
        const finalResult = parseFloat(result.toFixed(8));
        setDisplay(String(finalResult));
        
        const equationString = `${operand1} ${operator} ${currentOperand2} = ${finalResult}`;
        setHistory(equationString);

        setOperand1(null);
        setOperator(null);
        setOperand2(null);
        setWaitingForOperand2(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden p-6">
        
        {/* Header / Title */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-slate-100">Calculator</h1>
              <p className="text-xs text-slate-400">Made with React</p>
            </div>
          </div>
          <button 
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Reset All"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* History Dropdown / Preview */}
        <div className="mb-3 h-14 bg-slate-950/60 rounded-2xl p-3 flex flex-col justify-end text-right border border-slate-800/80">
          <div className="text-xs text-slate-500 truncate">{history || 'No previous calculation'}</div>
          <div className="text-xs text-indigo-400 font-mono">{equation}</div>
        </div>

        {/* Main Display */}
        <div className="mb-6 bg-slate-950/90 rounded-2xl p-4 text-right border border-slate-800 shadow-inner">
          <div className="text-3xl sm:text-4xl font-mono font-semibold tracking-wider text-white overflow-x-auto whitespace-nowrap scrollbar-none">
            {display}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1: Advanced functions */}
          <button 
            onClick={handleClear}
            className="p-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-2xl font-semibold transition-all active:scale-95"
          >
            AC
          </button>
          <button 
            onClick={handleSquareRoot}
            className="p-3.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-2xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            <span>√x</span>
          </button>
          <button 
            onClick={handlePercentage}
            className="p-3.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-2xl font-semibold transition-all active:scale-95"
          >
            %
          </button>
          <button 
            onClick={() => handleOperator('exp', "^")}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            x^y
          </button>

          {/* Row 2: Numbers & Division */}
          <button 
            onClick={() => handleNumber('7')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            7
          </button>
          <button 
            onClick={() => handleNumber('8')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            8
          </button>
          <button 
            onClick={() => handleNumber('9')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            9
          </button>
          <button 
            onClick={() => handleOperator('div', "/")}
            className="p-3.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-2xl font-semibold transition-all active:scale-95 text-lg"
          >
            ÷
          </button>

          {/* Row 3: Numbers & Multiplication */}
          <button 
            onClick={() => handleNumber('4')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            4
          </button>
          <button 
            onClick={() => handleNumber('5')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            5
          </button>
          <button 
            onClick={() => handleNumber('6')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            6
          </button>
          <button 
            onClick={() => handleOperator('mul', "*")}
            className="p-3.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-2xl font-semibold transition-all active:scale-95 text-lg"
          >
            ×
          </button>

          {/* Row 4: Numbers & Subtraction */}
          <button 
            onClick={() => handleNumber('1')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            1
          </button>
          <button 
            onClick={() => handleNumber('2')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            2
          </button>
          <button 
            onClick={() => handleNumber('3')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            3
          </button>
          <button 
            onClick={() => handleOperator('sub', "-")}
            className="p-3.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-2xl font-semibold transition-all active:scale-95 text-lg"
          >
            -
          </button>

          {/* Row 5: Zeros, Decimal, Addition */}
          <button 
            onClick={() => handleNumber('0')}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95 col-span-2"
          >
            0
          </button>
          <button 
            onClick={handleDecimal}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold transition-all active:scale-95"
          >
            .
          </button>
          <button 
            onClick={() => handleOperator('add', "+")}
            className="p-3.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-2xl font-semibold transition-all active:scale-95 text-lg"
          >
            +
          </button>

          {/* Row 6: Backspace & Equals */}
          <button 
            onClick={handleBackspace}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-semibold transition-all active:scale-95 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button 
            onClick={handleCalculate}
            className="p-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 col-span-3 text-lg"
          >
            =
          </button>
        </div>

      </div>
    </div>
  );
}