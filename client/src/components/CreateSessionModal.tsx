import { useState } from 'react';
import { X } from 'lucide-react';
import { SessionMetadata } from '../types';
import { createSession } from '../storage/sessionStore';

interface CreateSessionModalProps {
  isOpen: boolean;
  projectId: string;
  models: Array<{ id: string; name: string }>;
  onClose: () => void;
  onCreated: (session: SessionMetadata) => void;
}

export function CreateSessionModal({ isOpen, projectId, models, onClose, onCreated }: CreateSessionModalProps) {
  const [name, setName] = useState('');
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !selectedModel) return;

    setLoading(true);
    try {
      const session = await createSession({
        projectId,
        name: name.trim(),
        model: selectedModel,
      });
      onCreated(session);
      onClose();
      setName('');
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-100 border border-surface-300 rounded-xl w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-surface-300">
          <h2 className="text-lg font-semibold text-gray-200">Create New Session</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-300 rounded text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Session Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
              placeholder="New Session"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">AI Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
              required
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-300 hover:bg-surface-400 rounded-lg text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:bg-surface-400 disabled:text-gray-500 rounded-lg text-white font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
