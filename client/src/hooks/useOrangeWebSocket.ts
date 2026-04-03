import { useState, useEffect, useCallback, useRef } from 'react';

export function useOrangeWebSocket(port: number = 34567) {
  const [messages, setMessages] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'stream_token') {
        setMessages((prev) => prev + data.params.token);
      } else if (data.method === 'stream_start') {
        setMessages(''); // clear for new message
      }
    };

    return () => {
      ws.close();
    };
  }, [port]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        jsonrpc: "2.0",
        method: "chat",
        params: { message: text },
        id: Date.now()
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { isConnected, messages, sendMessage };
}
