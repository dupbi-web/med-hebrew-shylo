import React, { useState, useEffect, useRef, useMemo } from 'react';
import promptsData from '../data/soap_prompts.json';

type Category = 'S' | 'O' | 'A' | 'P';

interface Prompt {
  id: string;
  category: Category;
  prompt: string;
  answer: string;
}

const CATEGORY_LABELS: Record<Category, string> = {
  S: 'סובייקטיבי',
  O: 'אובייקטיבי',
  A: 'הערכה',
  P: 'תכנית',
};

const allPrompts: Prompt[] = promptsData as Prompt[];

type Metrics = {
  correct: number;
  incorrect: number;
  total: number;
  accuracy: number;
  cpm: number;
  wpm: number;
  elapsed: number;
};

const getMetrics = (input: string, answer: string, start: number | null, end: number): Metrics => {
  const inputChars = Array.from(input);
  const answerChars = Array.from(answer);
  let correct = 0;
  for (let i = 0; i < inputChars.length; i++) {
    if (inputChars[i] === answerChars[i]) correct++;
  }
  const total = inputChars.length;
  const incorrect = total - correct;
  const elapsed = start ? (end - start) / 1000 : 0;
  const minutes = elapsed / 60;
  const cpm = minutes > 0 ? Math.round(total / minutes) : 0;
  const wpm = minutes > 0 ? Math.round(total / 5 / minutes) : 0;
  const accuracy = total === 0 ? 100 : Math.round((correct / total) * 100);
  return { correct, incorrect, total, accuracy, cpm, wpm, elapsed };
};

const TypingGame: React.FC<{ prompts: Prompt[]; onBack: () => void }> = ({ prompts, onBack }) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [promptStart, setPromptStart] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState<Metrics[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [metricMode, setMetricMode] = useState<'cpm' | 'wpm'>('cpm');
  const [forgiving, setForgiving] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentPrompt = prompts[currentPromptIndex];
  const totalPrompts = prompts.length;

  const normalize = (s: string) => s.replace(/[\s.,!?\-–—:;"'()\[\]{}]/g, '');

  const metrics = useMemo(() => {
    const end = Date.now();
    const answerText = forgiving ? normalize(currentPrompt?.answer || '') : currentPrompt?.answer || '';
    const inputText = forgiving ? normalize(userInput) : userInput;
    return getMetrics(inputText, answerText, promptStart, end);
  }, [userInput, currentPrompt, promptStart, forgiving]);

  const sessionMetrics = useMemo(() => {
    const totalCorrect = sessionStats.reduce((a, s) => a + s.correct, 0) + metrics.correct;
    const totalIncorrect = sessionStats.reduce((a, s) => a + s.incorrect, 0) + metrics.incorrect;
    const total = totalCorrect + totalIncorrect;
    const accuracy = total === 0 ? 100 : Math.round((totalCorrect / total) * 100);
    return { totalCorrect, totalIncorrect, total, accuracy };
  }, [sessionStats, metrics]);

  useEffect(() => {
    if (userInput.length === 1 && !promptStart) {
      const now = Date.now();
      setPromptStart(now);
      if (!sessionStart) setSessionStart(now);
    }
  }, [userInput, promptStart, sessionStart]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentPromptIndex]);

  useEffect(() => {
    if (!currentPrompt) return;
    const end = Date.now();
    const answerText = forgiving ? normalize(currentPrompt.answer) : currentPrompt.answer;
    const inputText = forgiving ? normalize(userInput) : userInput;
    if (inputText === answerText) {
      const completedMetrics = getMetrics(inputText, answerText, promptStart, end);
      setSessionStats((prev) => [...prev, completedMetrics]);

      setTimeout(() => {
        if (currentPromptIndex + 1 < totalPrompts) {
          setCurrentPromptIndex((prev) => prev + 1);
          setUserInput('');
          setPromptStart(null);
        } else {
          setShowSummary(true);
        }
      }, 600);
    }
  }, [userInput, currentPrompt, currentPromptIndex, totalPrompts, forgiving, promptStart]);

  const handleRestart = () => {
    setCurrentPromptIndex(0);
    setUserInput('');
    setSessionStart(null);
    setPromptStart(null);
    setSessionStats([]);
    setShowSummary(false);
    setMetricMode('cpm');
    setForgiving(false);
    inputRef.current?.focus();
  };

  const handleNext = () => {
    const end = Date.now();
    const answerText = forgiving ? normalize(currentPrompt.answer) : currentPrompt.answer;
    const inputText = forgiving ? normalize(userInput) : userInput;
    const completedMetrics = getMetrics(inputText, answerText, promptStart, end);
    setSessionStats((prev) => [...prev, completedMetrics]);

    if (currentPromptIndex + 1 < totalPrompts) {
      setCurrentPromptIndex((prev) => prev + 1);
      setUserInput('');
      setPromptStart(null);
    } else {
      setShowSummary(true);
    }
  };

  const handleRetry = () => {
    setUserInput('');
    setPromptStart(null);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (currentPrompt) value = Array.from(value).slice(0, Array.from(currentPrompt.answer).length).join('');
    setUserInput(value);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSummary && (e.key === 'Enter' || e.key === ' ')) handleRestart();
      if (!showSummary && e.key === 'Escape') handleRetry();
      if (!showSummary && e.key === 'Enter' && userInput !== currentPrompt?.answer) handleNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSummary, userInput, currentPrompt]);

  const progress = Math.round(((currentPromptIndex + 1) / totalPrompts) * 100);

  if (showSummary) {
    const totalTime = sessionStart ? (Date.now() - sessionStart) / 1000 : 0;
    const totalMinutes = totalTime / 60;
    const totalTyped = sessionStats.reduce((a, s) => a + s.total, 0);
    const cpm = totalMinutes > 0 ? Math.round(totalTyped / totalMinutes) : 0;
    const wpm = totalMinutes > 0 ? Math.round(totalTyped / 5 / totalMinutes) : 0;
    const accuracy = sessionMetrics.accuracy;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] rtl font-hebrew">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">סיום תרגול</h2>
          <div className="mb-4">
            <div className="text-lg">דיוק: <span className="font-mono text-green-700">{accuracy}%</span></div>
            <div className="text-lg">{metricMode === 'cpm' ? 'תווים לדקה' : 'מילים לדקה'}: <span className="font-mono text-blue-700">{metricMode === 'cpm' ? cpm : wpm}</span></div>
            <div className="text-lg">הושלמו {totalPrompts} תרגולים</div>
          </div>
          <div className="flex justify-center gap-4">
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleRestart}>התחל מחדש</button>
            <button className="mt-4 px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={onBack}>בחר קטגוריה</button>
          </div>
        </div>
      </div>
    );
  }

  const renderPrompt = () => {
    const chars = Array.from(currentPrompt.prompt);
    return (
      <div className="flex flex-row-reverse flex-wrap gap-1 justify-end font-mono text-xl select-none leading-relaxed tracking-wide">
        {chars.map((char, i) => {
          let state = '';
          const inputChar = Array.from(userInput)[i];
          if (inputChar === undefined) state = 'text-gray-400';
          else if (forgiving ? normalize(inputChar) === normalize(char) : inputChar === char) state = 'text-green-600';
          else state = 'text-red-500 underline';
          return <span key={i} className={state}>{char}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 font-hebrew" lang="he">
      <div className="flex flex-col items-center w-full">
        <h1 className="text-2xl font-bold mb-2">תרגול הקלדה רפואית</h1>
        <div className="mt-2 text-sm text-gray-500">{currentPromptIndex + 1} / {totalPrompts}</div>
        <div className="w-full bg-gray-200 h-2 rounded mt-2">
          <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-6 mt-4">
        {renderPrompt()}
        <textarea
          ref={inputRef}
          className="w-full border-2 border-gray-300 rounded px-4 py-3 mt-4 text-lg font-mono focus:outline-none focus:border-blue-500 disabled:bg-gray-100 resize-none"
          style={{ fontFamily: 'inherit' }}
          value={userInput}
          onChange={handleInputChange}
          placeholder="הקלד כאן..."
          autoFocus
          onPaste={(e) => e.preventDefault()}
          disabled={forgiving ? normalize(userInput) === normalize(currentPrompt.answer) : userInput === currentPrompt.answer}
          rows={3}
        />
        <div className="flex flex-row-reverse gap-2 mt-4">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={forgiving} onChange={() => setForgiving(f => !f)} />
            מצב סלחני (התעלם מרווחים/סימני פיסוק)
          </label>
          <button className="px-2 py-1 text-xs bg-gray-100 rounded border ml-2" onClick={() => setMetricMode(m => m === 'cpm' ? 'wpm' : 'cpm')}>
            {metricMode === 'cpm' ? 'הצג מילים לדקה' : 'הצג תווים לדקה'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main wrapper component to select category
const TypingGameWrapper: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  if (!selectedCategory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] rtl font-hebrew">
        <h1 className="text-2xl font-bold mb-4">בחר קטגוריה לתרגול</h1>
        <div className="grid grid-cols-2 gap-4">
          {(['S', 'O', 'A', 'P'] as Category[]).map((cat) => (
            <button
              key={cat}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} - {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const filteredPrompts = allPrompts.filter((p) => p.category === selectedCategory);

  return <TypingGame prompts={filteredPrompts} onBack={() => setSelectedCategory(null)} />;
};

export default TypingGameWrapper;
