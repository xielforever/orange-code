import localforage from 'localforage';
import { Project } from '../types';

const PROJECTS_KEY = 'orange_projects';

export async function getProjects(): Promise<Project[]> {
  const projects = await localforage.getItem<Project[]>(PROJECTS_KEY);
  return projects || [];
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const newProject: Project = {
    ...project,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const projects = await getProjects();
  projects.push(newProject);
  await localforage.setItem(PROJECTS_KEY, projects);
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await localforage.setItem(PROJECTS_KEY, projects);
  return projects[index];
}

export async function deleteProject(id: string): Promise<void> {
  const projects = await getProjects();
  const filtered = projects.filter(p => p.id !== id);
  await localforage.setItem(PROJECTS_KEY, filtered);
}
