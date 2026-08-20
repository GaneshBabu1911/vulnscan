import { useEffect, useRef, useState } from 'react';
import { scanAPI } from '../services/api';

interface ScanPollState {
  progress: number;
  status: string;
  logs: string;
}

export function useScanPolling(
  scanId: number | null,
  options?: { intervalMs?: number; onComplete?: (scanId: number) => void }
) {
  const [state, setState] = useState<ScanPollState>({ progress: 0, status: '', logs: '' });
  const logRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(options?.onComplete);
  const intervalMs = options?.intervalMs ?? 2000;

  useEffect(() => {
    onCompleteRef.current = options?.onComplete;
  }, [options?.onComplete]);

  useEffect(() => {
    if (!scanId) return;

    const poll = async () => {
      try {
        const { data } = await scanAPI.logs(scanId);
        setState({ progress: data.progress, status: data.status, logs: data.logs });
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
        if (data.status === 'completed' || data.status === 'failed') {
          if (data.status === 'completed') onCompleteRef.current?.(scanId);
          return true;
        }
      } catch {
        return true;
      }
      return false;
    };

    const interval = setInterval(async () => {
      const done = await poll();
      if (done) clearInterval(interval);
    }, intervalMs);

    poll();
    return () => clearInterval(interval);
  }, [scanId, intervalMs]);

  return { ...state, logRef };
}
