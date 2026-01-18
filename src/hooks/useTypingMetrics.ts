import { useState, useRef, useCallback } from 'react';

export interface TypingMetrics {
  startTime: number | null;
  charactersTyped: number;
  backspaceCount: number;
  pauseCount: number;
  elapsedSeconds: number;
  cpm: number;
  wpm: number;
}

export const useTypingMetrics = () => {
  const [metrics, setMetrics] = useState<TypingMetrics>({
    startTime: null,
    charactersTyped: 0,
    backspaceCount: 0,
    pauseCount: 0,
    elapsedSeconds: 0,
    cpm: 0,
    wpm: 0,
  });

  const lastKeystrokeTime = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    const now = Date.now();
    setMetrics(prev => ({
      ...prev,
      startTime: now,
      charactersTyped: 0,
      backspaceCount: 0,
      pauseCount: 0,
      elapsedSeconds: 0,
      cpm: 0,
      wpm: 0,
    }));
    lastKeystrokeTime.current = now;

    // Update elapsed time every second
    intervalRef.current = window.setInterval(() => {
      setMetrics(prev => {
        if (!prev.startTime) return prev;
        const elapsed = (Date.now() - prev.startTime) / 1000;
        const cpm = elapsed > 0 ? Math.round((prev.charactersTyped / elapsed) * 60) : 0;
        const wpm = Math.round(cpm / 5); // Standard: 5 chars = 1 word
        return {
          ...prev,
          elapsedSeconds: Math.round(elapsed),
          cpm,
          wpm,
        };
      });
    }, 1000);
  }, []);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const recordKeystroke = useCallback((isBackspace: boolean, newLength: number) => {
    const now = Date.now();
    
    setMetrics(prev => {
      // Start tracking on first keystroke
      if (!prev.startTime) {
        startTracking();
        return {
          ...prev,
          startTime: now,
          charactersTyped: isBackspace ? 0 : 1,
          backspaceCount: isBackspace ? 1 : 0,
        };
      }

      // Detect pause (>2 seconds between keystrokes)
      const pauseDetected = lastKeystrokeTime.current && 
        (now - lastKeystrokeTime.current) > 2000;

      lastKeystrokeTime.current = now;

      return {
        ...prev,
        charactersTyped: isBackspace ? prev.charactersTyped : prev.charactersTyped + 1,
        backspaceCount: isBackspace ? prev.backspaceCount + 1 : prev.backspaceCount,
        pauseCount: pauseDetected ? prev.pauseCount + 1 : prev.pauseCount,
      };
    });
  }, [startTracking]);

  const resetMetrics = useCallback(() => {
    stopTracking();
    setMetrics({
      startTime: null,
      charactersTyped: 0,
      backspaceCount: 0,
      pauseCount: 0,
      elapsedSeconds: 0,
      cpm: 0,
      wpm: 0,
    });
    lastKeystrokeTime.current = null;
  }, [stopTracking]);

  return {
    metrics,
    recordKeystroke,
    resetMetrics,
    stopTracking,
  };
};
