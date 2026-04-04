import { useEffect, useState } from 'react';
import { Folder, Plus, Trash2 } from 'lucide-react';
import { Project } from '../types';
import { getProjects, deleteProject } from '../storage/projectStore';

interface ProjectListProps {
  currentProjectId?: string;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
}

export function ProjectList({ currentProjectId, onSelectProject, onCreateProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  }

  async function handleDelete(project: Project, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Delete project "${project.name}"?`)) {
      await deleteProject(project.id);
      loadProjects();
    }
  }

  if (loading) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-surface-300">
        <span className="text-sm font-bold text-gray-400">PROJECTS</span>
        <button
          onClick={onCreateProject}
          className="p-1.5 hover:bg-surface-300 rounded text-orange-500 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {projects.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No projects yet. Create one to get started!
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors
                ${currentProjectId === project.id ? 'bg-orange-500/10 text-orange-400' : 'hover:bg-surface-300 text-gray-300'}`}
            >
              <Folder size={16} className={currentProjectId === project.id ? 'text-orange-400' : 'text-gray-500'} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{project.name}</div>
                <div className="text-xs text-gray-500 truncate">{project.path}</div>
              </div>
              <button
                onClick={(e) => handleDelete(project, e)}
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
