// projectManager.js
// Owns the full collection of projects and handles localStorage persistence.
// This is the ONLY module that talks to localStorage.

import { createProject } from "./project.js";
import { createTodo } from "./todo.js";

const STORAGE_KEY = "todoAppData";
const DEFAULT_PROJECT_NAME = "Default";

function createProjectManager() {
  let projects = [];

  function addProject(name) {
    const project = createProject(name);
    projects.push(project);
    saveToStorage();
    return project;
  }

  function removeProject(projectId) {
    const project = projects.find((p) => p.id === projectId);
    if (project && project.name === DEFAULT_PROJECT_NAME) {
      console.warn("Cannot delete the Default project.");
      return false;
    }
    projects = projects.filter((p) => p.id !== projectId);
    saveToStorage();
    return true;
  }

  function getProject(projectId) {
    return projects.find((p) => p.id === projectId);
  }

  function getAllProjects() {
    return projects;
  }

  function getDefaultProject() {
    return projects.find((p) => p.name === DEFAULT_PROJECT_NAME);
  }

  // --- Persistence ---

  function saveToStorage() {
    try {
      const serializable = projects.map((project) => ({
        id: project.id,
        name: project.name,
        todos: project.todos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          dueDate: todo.dueDate,
          priority: todo.priority,
          notes: todo.notes,
          checklist: todo.checklist,
          completed: todo.completed,
        })),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const parsedProjects = JSON.parse(raw);
      if (!Array.isArray(parsedProjects)) return false;

      projects = parsedProjects.map((projectData) => {
        const project = createProject(projectData.name, projectData.id);
        project.todos = (projectData.todos || []).map((todoData) =>
          createTodo(todoData)
        );
        return project;
      });

      return true;
    } catch (err) {
      console.error("Failed to load from localStorage:", err);
      return false;
    }
  }

  function init() {
    const loaded = loadFromStorage();
    if (!loaded || projects.length === 0) {
      projects = [];
      addProject(DEFAULT_PROJECT_NAME);
    }
  }

  init();

  return {
    addProject,
    removeProject,
    getProject,
    getAllProjects,
    getDefaultProject,
    saveToStorage,
  };
}

export { createProjectManager, DEFAULT_PROJECT_NAME };
