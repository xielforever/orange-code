import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { SessionMetadata } from '../types';
import { getSessions, deleteSession } from '../storage/sessionStore';

interface SessionListProps {
  projectId: string;
  currentSessionId?: string;
  onSelectSession: (session: SessionMetadata) => void;
  onCreateSession: () => void;
}

export function SessionList({ projectId, currentSessionId, onSelectSession, onCreateSession }: SessionListProps) {
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);

  useEffect(() => {
    loadSessions();
  }, [projectId]);

  async function loadSessions() {
    const data = await getSessions(projectId);
    setSessions(data);
  }

  async function handleDelete(session: SessionMetadata, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Delete session "${session.name}"?`)) {
      await deleteSession(session.id);
      loadSessions();
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-surface-300">
        <span className="text-sm font-bold text-gray-400">SESSIONS</span>
        <button
          onClick={onCreateSession}
          className="p-1.5 hover:bg-surface-300 rounded text-orange-500 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No sessions yet. Create one to start chatting!
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors
                ${currentSessionId === session.id ? 'bg-orange-500/10 text-orange-400' : 'hover:bg-surface-300 text-gray-300'}`}
            >
              <MessageSquare size={16} className={currentSessionId === session.id ? 'text-orange-400' : 'text-gray-500'} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{session.name}</div>
                <div className="text-xs text-gray-500">{session.model}</div>
              </div>
              <button
                onClick={(e) => handleDelete(session, e)}
                className="p-1 hover:text-red-400 text-gray-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
