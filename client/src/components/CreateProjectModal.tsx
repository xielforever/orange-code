import { useState } from 'react';
import { X, FolderOpen } from 'lucide-react';
import { Project } from '../types';
import { createProject } from '../storage/projectStore';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;

    setLoading(true);
    try {
      const project = await createProject({
        name: name.trim(),
        path: path.trim(),
        description: description.trim() || undefined,
      });
      onCreated(project);
      onClose();
      setName('');
      setPath('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectFolder() {
    const selectedPath = await window.electronAPI.selectFolder?.();
    if (selectedPath) {
      setPath(selectedPath);
      const folderName = selectedPath.split(/[/\\]/).pop() || '';
      if (!name) setName(folderName);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-100 border border-surface-300 rounded-xl w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-surface-300">
          <h2 className="text-lg font-semibold text-gray-200">Create New Project</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-300 rounded text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
              placeholder="My Awesome Project"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Project Path</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="flex-1 bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
                placeholder="/path/to/project"
                required
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                className="px-3 py-2 bg-surface-300 hover:bg-surface-400 border border-surface-400 rounded-lg text-gray-300 transition-colors"
              >
                <FolderOpen size={18} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500 resize-none"
              rows={3}
              placeholder="A short description of this project..."
            />
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
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
