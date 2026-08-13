# Focus — To-Do App

A todo list app built for The Odin Project's "Todo List" assignment.

## Run it

```bash
npm install
npm start
```

This opens the app at `http://localhost:8080` with hot reload.

To build a static production version into `dist/`:

```bash
npm run build
```

## Project structure

```
src/
  todo.js            Pure factory function for a single todo (data + methods)
  project.js         Pure factory function for a project (a list of todos)
  projectManager.js  Owns the collection of projects; the ONLY module that
                      talks to localStorage
  app.js             Application layer — the sole bridge between the logic
                      modules above and the DOM layer below. Never touches
                      `document`.
  dom.js             The ONLY module that touches `document`. Renders state
                      and wires up events; every mutation goes through app.js
                      and is followed by a re-render.
  index.js           Entry point — imports styles, boots dom.js
  index.html          Page shell (sidebar, content area, two <dialog>s)
  styles.css          Styling
```

### Why it's split this way

- **`todo.js` / `project.js` / `projectManager.js`** never import from `dom.js`
  and never reference `document`. They're plain, testable logic.
- **`app.js`** is the single choke point `dom.js` is allowed to call into. If
  you swapped vanilla JS for React later, only `dom.js` would need to change.
- **`dom.js`** never mutates a todo or project object directly — it always
  calls an `app.js` function, then re-renders from the current state.

## Features implemented

- Create/edit/delete todos with title, description, due date, priority,
  notes, and a per-todo checklist
- Multiple projects, with a protected "Default" project that can't be deleted
- Expand a todo (via its card) to view/edit full details in a dialog
- Priority-based color coding on each todo card
- Due-date formatting and overdue/"due today" highlighting via `date-fns`
- Persistence via `localStorage` — reloading the page keeps all data;
  methods are correctly re-attached to plain JSON objects on load
- App never crashes on missing/corrupted `localStorage` data — it falls
  back to a fresh Default project
