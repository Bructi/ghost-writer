import { useState, useEffect, useRef } from 'react';
// Vite handles this import magic for workers
import EmbedderWorker from '../utils/embedder.worker?worker&inline';

export function useEmbedder() {
    const [isReady, setIsReady] = useState(false);
    const workerRef = useRef(null);

    useEffect(() => {
        // Spawn the worker
        workerRef.current = new EmbedderWorker();
        setIsReady(true);

        return () => {
            workerRef.current.terminate();
        };
    }, []);

    const generateEmbedding = (text) => {
        return new Promise((resolve, reject) => {
            if (!workerRef.current) return reject("Worker not ready");

            const handleMessage = (e) => {
                if (e.data.status === 'complete') {
                    workerRef.current.removeEventListener('message', handleMessage);
                    resolve(e.data.embedding);
                } else if (e.data.status === 'error') {
                    workerRef.current.removeEventListener('message', handleMessage);
                    reject(e.data.error);
                }
            };

            workerRef.current.addEventListener('message', handleMessage);

            // Send data
            workerRef.current.postMessage({ type: 'embed', text });
        });
    };

    return { isReady, generateEmbedding };
}