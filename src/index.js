// index.js
// Entry point. Only responsibility: load styles and kick off the DOM layer.

import "./styles.css";
import { initApp } from "./dom.js";

document.addEventListener("DOMContentLoaded", initApp);
