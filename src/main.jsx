/**
 * src/main.js
 * Entry point - REACT ROUTER & ZERO-STORAGE VERSION
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Pointing to your new App.jsx
import './styles/global.css'; // Importing your existing styles

// 1. Target the 'app' div from your index.html
const container = document.getElementById('app');

// 2. Initialize the React Root
const root = ReactDOM.createRoot(container);

// 3. Render the application
// We wrap in StrictMode to help catch potential side effects during development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('OKZ Sports: React Bootstrapping complete.');