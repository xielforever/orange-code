import localforage from 'localforage';
import { SessionMetadata } from '../types';

const SESSIONS_KEY = 'orange_sessions';

export async function getSessions(projectId?: string): Promise<SessionMetadata[]> {
  const sessions = await localforage.getItem<SessionMetadata[]>(SESSIONS_KEY);
  const all = sessions || [];
  return projectId ? all.filter(s => s.projectId === projectId) : all;
}

export async function createSession(session: Omit<SessionMetadata, 'id' | 'createdAt' | 'updatedAt'>): Promise<SessionMetadata> {
  const newSession: SessionMetadata = {
    ...session,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const sessions = await getSessions();
  sessions.push(newSession);
  await localforage.setItem(SESSIONS_KEY, sessions);
  return newSession;
}

export async function updateSession(id: string, updates: Partial<SessionMetadata>): Promise<SessionMetadata | null> {
  const sessions = await getSessions();
  const index = sessions.findIndex(s => s.id === id);
  if (index === -1) return null;
  sessions[index] = {
    ...sessions[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await localforage.setItem(SESSIONS_KEY, sessions);
  return sessions[index];
}

export async function deleteSession(id: string): Promise<void> {
  const sessions = await getSessions();
  const filtered = sessions.filter(s => s.id !== id);
  await localforage.setItem(SESSIONS_KEY, filtered);
}
