// todo.js
// Pure data + behavior for a single todo. No DOM, no storage — just the object.

function generateId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

function createTodo({
  id,
  title,
  description = "",
  dueDate = "",
  priority = "low",
  notes = "",
  checklist = [],
  completed = false,
}) {
  return {
    id: id || generateId(),
    title,
    description,
    dueDate,
    priority, // "low" | "medium" | "high"
    notes,
    checklist, // [{ id, text, done }]
    completed,

    toggleComplete() {
      this.completed = !this.completed;
    },

    setPriority(newPriority) {
      this.priority = newPriority;
    },

    updateDetails({ title, description, dueDate, notes, priority } = {}) {
      if (title !== undefined) this.title = title;
      if (description !== undefined) this.description = description;
      if (dueDate !== undefined) this.dueDate = dueDate;
      if (notes !== undefined) this.notes = notes;
      if (priority !== undefined) this.priority = priority;
    },

    addChecklistItem(text) {
      this.checklist.push({ id: generateId(), text, done: false });
    },

    toggleChecklistItem(itemId) {
      const item = this.checklist.find((i) => i.id === itemId);
      if (item) item.done = !item.done;
    },

    removeChecklistItem(itemId) {
      this.checklist = this.checklist.filter((i) => i.id !== itemId);
    },
  };
}

export { createTodo, generateId };
