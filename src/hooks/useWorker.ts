import { useEffect, useRef, useState } from 'react';

interface UseWorkerOptions {
  onMessage?: (data: any) => void;
  onError?: (error: ErrorEvent) => void;
}

export function useWorker(workerScript: string, options: UseWorkerOptions = {}) {
  const workerRef = useRef<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Create worker from inline script
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerRef.current = new Worker(workerUrl);

      workerRef.current.onmessage = (event) => {
        setIsLoading(false);
        options.onMessage?.(event.data);
      };

      workerRef.current.onerror = (error) => {
        setIsLoading(false);
        setError(error.message);
        options.onError?.(error);
      };

      return () => {
        if (workerRef.current) {
          workerRef.current.terminate();
          URL.revokeObjectURL(workerUrl);
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create worker');
    }
  }, [workerScript]);

  const postMessage = (data: any) => {
    if (workerRef.current) {
      setIsLoading(true);
      setError(null);
      workerRef.current.postMessage(data);
    }
  };

  const terminate = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  return {
    postMessage,
    terminate,
    isLoading,
    error,
    isSupported: typeof Worker !== 'undefined'
  };
}