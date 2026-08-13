// project.js
// A project is a named container of todos. No DOM, no storage.

import { generateId } from "./todo.js";

function createProject(name, id) {
  return {
    id: id || generateId(),
    name,
    todos: [],

    addTodo(todo) {
      this.todos.push(todo);
    },

    removeTodo(todoId) {
      this.todos = this.todos.filter((todo) => todo.id !== todoId);
    },

    getTodo(todoId) {
      return this.todos.find((todo) => todo.id === todoId);
    },

    renameProject(newName) {
      this.name = newName;
    },
  };
}

export { createProject };
