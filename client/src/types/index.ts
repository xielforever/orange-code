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
