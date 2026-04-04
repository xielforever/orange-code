import { useState, useEffect, useCallback, useRef } from 'react';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

export function useOrangeWebSocket(port: number = 34567) {
  const [messages, setMessages] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const requestIdRef = useRef(0);
  const pendingRequests = useRef<Map<number, (result: any) => void>>(new Map());

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      sendRequest('get_models', {}).then(result => {
        setModels(result.models || []);
      });
    };
    ws.onclose = () => setIsConnected(false);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.id && pendingRequests.current.has(data.id)) {
        const callback = pendingRequests.current.get(data.id)!;
        pendingRequests.current.delete(data.id);
        callback(data.result || data.error);
        return;
      }
      
      if (data.method === 'stream_token') {
        setMessages((prev) => prev + data.params.token);
      } else if (data.method === 'stream_start') {
        setMessages('');
      }
    };

    return () => {
      ws.close();
    };
  }, [port]);

  const sendRequest = useCallback(async (method: string, params: any = {}) => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'));
        return;
      }

      const id = ++requestIdRef.current;
      pendingRequests.current.set(id, (result) => {
        if (result && result.code) {
          reject(result);
        } else {
          resolve(result);
        }
      });

      const payload = {
        jsonrpc: "2.0",
        method,
        params,
        id,
      };
      wsRef.current.send(JSON.stringify(payload));
    });
  }, []);

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

  const createSession = useCallback((projectId: string, model: string) => {
    return sendRequest('create_session', { project_id: projectId, model });
  }, [sendRequest]);

  const listSessions = useCallback((projectId?: string) => {
    return sendRequest('list_sessions', { project_id: projectId });
  }, [sendRequest]);

  const switchSession = useCallback((sessionId: string) => {
    return sendRequest('switch_session', { session_id: sessionId });
  }, [sendRequest]);

  const deleteSession = useCallback((sessionId: string) => {
    return sendRequest('delete_session', { session_id: sessionId });
  }, [sendRequest]);

  const setModel = useCallback((model: string) => {
    return sendRequest('set_model', { model });
  }, [sendRequest]);

  return { 
    isConnected, 
    messages, 
    sendMessage,
    models,
    createSession,
    listSessions,
    switchSession,
    deleteSession,
    setModel,
  };
}
