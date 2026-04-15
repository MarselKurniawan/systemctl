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

export function formatDurationText(seconds: number): string {
  if (!seconds || seconds <= 0) return '-';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0 && mins > 0) return `${hours} jam ${mins} menit ${secs} detik`;
  if (hours > 0) return `${hours} jam ${secs > 0 ? `0 menit ${secs} detik` : ''}`;
  if (mins > 0) return `${mins} menit ${secs} detik`;
  return `${secs} detik`;
}

export function formatDurationHMS(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00:00';
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}
