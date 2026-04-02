import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(startTimeISO?: string | null) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate initial seconds from DB start_time
  useEffect(() => {
    if (startTimeISO) {
      const startDate = new Date(startTimeISO);
      const now = new Date();
      const elapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 1000));
      setSeconds(elapsed);
      setIsRunning(true);
    }
  }, [startTimeISO]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
  }, []);

  const formatted = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(
    Math.floor((seconds % 3600) / 60)
  ).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return { seconds, isRunning, start, stop, reset, formatted };
}

export function formatDurationText(minutes: number): string {
  if (!minutes || minutes <= 0) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours} jam ${mins} menit`;
  if (hours > 0) return `${hours} jam`;
  return `${mins} menit`;
}
