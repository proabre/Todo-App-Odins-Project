// dom.js
// The ONLY module allowed to touch `document`. Renders state and wires up
// events. Every mutation goes through app.js, then triggers a re-render.

import { format, isPast, isToday, parseISO } from "date-fns";
import * as app from "./app.js";

const sidebarEl = document.querySelector("#project-list");
const contentEl = document.querySelector("#content");
const activeProjectNameEl = document.querySelector("#active-project-name");
const newProjectBtn = document.querySelector("#new-project-btn");
const newTodoBtn = document.querySelector("#new-todo-btn");
const deleteProjectBtn = document.querySelector("#delete-project-btn");

const todoDialog = document.querySelector("#todo-dialog");
const todoForm = document.querySelector("#todo-form");
const projectDialog = document.querySelector("#project-dialog");
const projectForm = document.querySelector("#project-form");

let editingTodoId = null; // null = creating a new todo

// ---------- Formatting helpers ----------

function formatDueDate(dueDate) {
  if (!dueDate) return "No due date";
  try {
    const date = parseISO(dueDate);
    const formatted = format(date, "MMM d, yyyy");
    if (isToday(date)) return `Today · ${formatted}`;
    if (isPast(date)) return `Overdue · ${formatted}`;
    return formatted;
  } catch {
    return dueDate;
  }
}

function dueDateClass(dueDate, completed) {
  if (!dueDate || completed) return "";
  try {
    const date = parseISO(dueDate);
    if (isToday(date)) return "due-today";
    if (isPast(date)) return "due-overdue";
  } catch {
    /* ignore malformed dates */
  }
  return "";
}

// ---------- Sidebar: project list ----------

function renderProjectList() {
  sidebarEl.innerHTML = "";
  const projects = app.getAllProjects();
  const activeProject = app.getActiveProject();

  projects.forEach((project) => {
    const li = document.createElement("li");

    const btn = document.createElement("button");
    btn.className = "project-btn";
    btn.textContent = project.name;
    if (activeProject && project.id === activeProject.id) {
      btn.classList.add("active");
    }

    const count = document.createElement("span");
    count.className = "project-count";
    const openCount = project.todos.filter((t) => !t.completed).length;
    count.textContent = openCount;
    btn.appendChild(count);

    btn.addEventListener("click", () => {
      app.setActiveProject(project.id);
      renderAll();
    });

    li.appendChild(btn);
    sidebarEl.appendChild(li);
  });
}

// ---------- Main content: todo list ----------

function renderTodoList() {
  contentEl.innerHTML = "";
  const project = app.getActiveProject();
  if (!project) return;

  activeProjectNameEl.textContent = project.name;
  deleteProjectBtn.hidden = project.name === app.DEFAULT_PROJECT_NAME;
  deleteProjectBtn.dataset.projectId = project.id;

  if (project.todos.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No todos yet. Add one to get started.";
    contentEl.appendChild(empty);
    return;
  }

  // Incomplete todos first, then completed, each sorted by due date
  const sorted = [...project.todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.dueDate || "").localeCompare(b.dueDate || "");
  });

  sorted.forEach((todo) => {
    contentEl.appendChild(buildTodoCard(project, todo));
  });
}

function buildTodoCard(project, todo) {
  const card = document.createElement("div");
  card.className = `todo-card priority-${todo.priority}`;
  if (todo.completed) card.classList.add("completed");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", (e) => {
    e.stopPropagation();
    app.toggleTodoComplete(project.id, todo.id);
    renderAll();
  });

  const main = document.createElement("div");
  main.className = "todo-main";

  const title = document.createElement("p");
  title.className = "todo-title";
  title.textContent = todo.title;

  const meta = document.createElement("p");
  meta.className = `todo-due ${dueDateClass(todo.dueDate, todo.completed)}`;
  meta.textContent = formatDueDate(todo.dueDate);

  main.append(title, meta);

  const priorityTag = document.createElement("span");
  priorityTag.className = "priority-tag";
  priorityTag.textContent = todo.priority;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-btn delete-btn";
  deleteBtn.setAttribute("aria-label", "Delete todo");
  deleteBtn.textContent = "✕";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    app.deleteTodo(project.id, todo.id);
    renderAll();
  });

  card.append(checkbox, main, priorityTag, deleteBtn);

  card.addEventListener("click", () => openTodoDialog(project, todo));

  return card;
}

// ---------- Todo dialog (create + expand/edit) ----------

function openTodoDialog(project, todo = null) {
  editingTodoId = todo ? todo.id : null;
  todoForm.reset();

  todoForm.elements.title.value = todo?.title || "";
  todoForm.elements.description.value = todo?.description || "";
  todoForm.elements.dueDate.value = todo?.dueDate || "";
  todoForm.elements.priority.value = todo?.priority || "low";
  todoForm.elements.notes.value = todo?.notes || "";

  document.querySelector("#todo-dialog-title").textContent = todo
    ? "Edit todo"
    : "New todo";

  renderChecklist(project, todo);

  todoDialog.showModal();
}

function renderChecklist(project, todo) {
  const list = document.querySelector("#checklist-items");
  const addForm = document.querySelector("#checklist-add-row");
  list.innerHTML = "";

  if (!todo) {
    // Checklist only available once a todo exists (post-save)
    addForm.hidden = true;
    document.querySelector("#checklist-section").hidden = true;
    return;
  }

  document.querySelector("#checklist-section").hidden = false;
  addForm.hidden = false;

  todo.checklist.forEach((item) => {
    const li = document.createElement("li");
    li.className = "checklist-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = item.done;
    cb.addEventListener("change", () => {
      app.toggleChecklistItem(project.id, todo.id, item.id);
      renderChecklist(project, app.getActiveProject().getTodo(todo.id));
      renderTodoList();
    });

    const span = document.createElement("span");
    span.textContent = item.text;
    if (item.done) span.classList.add("done");

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "icon-btn";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => {
      app.removeChecklistItem(project.id, todo.id, item.id);
      renderChecklist(project, app.getActiveProject().getTodo(todo.id));
    });

    li.append(cb, span, removeBtn);
    list.appendChild(li);
  });
}

function handleChecklistAdd() {
  const project = app.getActiveProject();
  if (!editingTodoId || !project) return;

  const input = document.querySelector("#checklist-input");
  app.addChecklistItem(project.id, editingTodoId, input.value);
  input.value = "";
  input.focus();

  renderChecklist(project, project.getTodo(editingTodoId));
  renderTodoList();
}

function handleTodoFormSubmit(e) {
  e.preventDefault();
  const project = app.getActiveProject();
  if (!project) return;

  const formData = new FormData(todoForm);
  const todoData = {
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    notes: formData.get("notes").trim(),
  };

  if (!todoData.title) return;

  if (editingTodoId) {
    app.editTodo(project.id, editingTodoId, todoData);
  } else {
    app.addTodoToProject(project.id, todoData);
  }

  editingTodoId = null;
  todoDialog.close();
  renderAll();
}

// ---------- Project dialog (create) ----------

function openProjectDialog() {
  projectForm.reset();
  projectDialog.showModal();
}

function handleProjectFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(projectForm);
  const name = formData.get("name");
  const project = app.createNewProject(name);
  if (project) {
    app.setActiveProject(project.id);
  }
  projectDialog.close();
  renderAll();
}

function handleDeleteProject() {
  const projectId = deleteProjectBtn.dataset.projectId;
  if (!projectId) return;
  if (!confirm("Delete this project and all of its todos?")) return;
  app.deleteProject(projectId);
  renderAll();
}

// ---------- Wire up static listeners ----------

function bindEvents() {
  newProjectBtn.addEventListener("click", openProjectDialog);
  deleteProjectBtn.addEventListener("click", handleDeleteProject);

  newTodoBtn.addEventListener("click", () => {
    const project = app.getActiveProject();
    if (project) openTodoDialog(project, null);
  });

  todoForm.addEventListener("submit", handleTodoFormSubmit);
  document
    .querySelector("#todo-cancel-btn")
    .addEventListener("click", () => todoDialog.close());

  projectForm.addEventListener("submit", handleProjectFormSubmit);
  document
    .querySelector("#project-cancel-btn")
    .addEventListener("click", () => projectDialog.close());

  document
    .querySelector("#checklist-add-btn")
    .addEventListener("click", handleChecklistAdd);

  document.querySelector("#checklist-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent it from submitting the outer todo-form
      handleChecklistAdd();
    }
  });
}

// ---------- Public entry point ----------

function renderAll() {
  renderProjectList();
  renderTodoList();
}

function initApp() {
  bindEvents();
  renderAll();
}

export { initApp };