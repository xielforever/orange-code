export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: number | string;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: JsonRpcError;
  id?: number | string;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

export interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: number | string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

export interface SessionInfo {
  id: string;
  projectId: string;
  name: string;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectInfo {
  id: string;
  name: string;
  description?: string;
  path: string;
  createdAt: number;
  updatedAt: number;
  defaultModel?: string;
}

export interface StreamTokenEvent {
  token: string;
}

export interface ToolUseEvent {
  id: string;
  name: string;
  input: string;
}

export interface ToolResultEvent {
  id: string;
  result: string;
  isError?: boolean;
}

export interface UsageEvent {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
}

export interface StreamEndEvent {
  success: boolean;
  error?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  createdAt: number;
  updatedAt: number;
  defaultModel?: string;
}

export interface SessionMetadata {
  id: string;
  projectId: string;
  name: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  rustSessionPath?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'orange';
  apiKey?: string;
  baseUrl?: string;
}

export interface AppState {
  currentProjectId?: string;
  currentSessionId?: string;
}
