
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure the DOM is fully loaded before initializing React
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found. Make sure there is a div with id="root" in your HTML file.')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
