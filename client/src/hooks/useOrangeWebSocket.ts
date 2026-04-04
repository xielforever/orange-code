import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ModelInfo,
  SessionInfo,
  ProjectInfo,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcNotification,
  StreamTokenEvent,
  ToolUseEvent,
  ToolResultEvent,
  UsageEvent,
  StreamEndEvent,
} from '../types';

interface ChatState {
  messages: string;
  isStreaming: boolean;
}

export function useOrangeWebSocket(port: number = 34567) {
  const [isConnected, setIsConnected] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [currentProjectId, setCurrentProjectId] = useState<string>();
  const [chatState, setChatState] = useState<ChatState>({
    messages: '',
    isStreaming: false,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const requestIdRef = useRef(0);
  const pendingRequests = useRef<Map<number | string, (result: any) => void>>(new Map());

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
      const data: JsonRpcResponse | JsonRpcNotification = JSON.parse(event.data);
      
      if ('id' in data && data.id !== null && pendingRequests.current.has(data.id)) {
        const callback = pendingRequests.current.get(data.id)!;
        pendingRequests.current.delete(data.id);
        if ('error' in data && data.error) {
          callback({ error: data.error });
        } else {
          callback(data.result);
        }
        return;
      }
      
      if ('method' in data) {
        switch (data.method) {
          case 'stream_start':
            setChatState(prev => ({ ...prev, messages: '', isStreaming: true }));
            break;
          case 'stream_token':
            const tokenParams = data.params as StreamTokenEvent;
            setChatState(prev => ({ ...prev, messages: prev.messages + tokenParams.token }));
            break;
          case 'tool_use':
            // Handle tool use
            break;
          case 'tool_result':
            // Handle tool result
            break;
          case 'usage':
            // Handle usage
            break;
          case 'stream_end':
            setChatState(prev => ({ ...prev, isStreaming: false }));
            break;
          case 'session_updated':
            // Handle session update
            break;
          case 'error':
            // Handle error notification
            break;
        }
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

  const getSession = useCallback((sessionId: string) => {
    return sendRequest('get_session', { session_id: sessionId });
  }, [sendRequest]);

  const createProject = useCallback((name: string, path: string, description?: string) => {
    return sendRequest('create_project', { name, path, description });
  }, [sendRequest]);

  const listProjects = useCallback(() => {
    return sendRequest('list_projects', {});
  }, [sendRequest]);

  const deleteProject = useCallback((projectId: string) => {
    return sendRequest('delete_project', { project_id: projectId });
  }, [sendRequest]);

  const cancelChat = useCallback((sessionId?: string) => {
    return sendRequest('cancel_chat', { session_id: sessionId });
  }, [sendRequest]);

  return { 
    isConnected, 
    chatState,
    models,
    sessions,
    projects,
    currentSessionId,
    currentProjectId,
    sendMessage,
    createSession,
    listSessions,
    switchSession,
    deleteSession,
    getSession,
    setModel,
    createProject,
    listProjects,
    deleteProject,
    cancelChat,
  };
}
