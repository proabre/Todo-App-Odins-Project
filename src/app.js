// app.js
// The application layer. This is the ONLY bridge between the pure logic
// (todo.js, project.js, projectManager.js) and the DOM (dom.js).
// Nothing in here ever touches `document`.

import { createProjectManager, DEFAULT_PROJECT_NAME } from "./projectManager.js";
import { createTodo } from "./todo.js";

const projectManager = createProjectManager();
let activeProjectId = projectManager.getDefaultProject().id;

// --- Project-level actions ---

function getAllProjects() {
  return projectManager.getAllProjects();
}

function getActiveProject() {
  return projectManager.getProject(activeProjectId);
}

function setActiveProject(projectId) {
  activeProjectId = projectId;
}

function createNewProject(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const project = projectManager.addProject(trimmed);
  return project;
}

function deleteProject(projectId) {
  const wasActive = projectId === activeProjectId;
  const deleted = projectManager.removeProject(projectId);
  if (deleted && wasActive) {
    activeProjectId = projectManager.getDefaultProject().id;
  }
  return deleted;
}

// --- Todo-level actions ---

function addTodoToProject(projectId, todoData) {
  const project = projectManager.getProject(projectId);
  if (!project) return null;
  const todo = createTodo(todoData);
  project.addTodo(todo);
  projectManager.saveToStorage();
  return todo;
}

function deleteTodo(projectId, todoId) {
  const project = projectManager.getProject(projectId);
  if (!project) return;
  project.removeTodo(todoId);
  projectManager.saveToStorage();
}

function toggleTodoComplete(projectId, todoId) {
  const todo = projectManager.getProject(projectId)?.getTodo(todoId);
  todo?.toggleComplete();
  projectManager.saveToStorage();
}

function editTodo(projectId, todoId, updates) {
  const todo = projectManager.getProject(projectId)?.getTodo(todoId);
  todo?.updateDetails(updates);
  projectManager.saveToStorage();
}

function addChecklistItem(projectId, todoId, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const todo = projectManager.getProject(projectId)?.getTodo(todoId);
  todo?.addChecklistItem(trimmed);
  projectManager.saveToStorage();
}

function toggleChecklistItem(projectId, todoId, itemId) {
  const todo = projectManager.getProject(projectId)?.getTodo(todoId);
  todo?.toggleChecklistItem(itemId);
  projectManager.saveToStorage();
}

function removeChecklistItem(projectId, todoId, itemId) {
  const todo = projectManager.getProject(projectId)?.getTodo(todoId);
  todo?.removeChecklistItem(itemId);
  projectManager.saveToStorage();
}

export {
  DEFAULT_PROJECT_NAME,
  getAllProjects,
  getActiveProject,
  setActiveProject,
  createNewProject,
  deleteProject,
  addTodoToProject,
  deleteTodo,
  toggleTodoComplete,
  editTodo,
  addChecklistItem,
  toggleChecklistItem,
  removeChecklistItem,
};
