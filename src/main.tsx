
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure the DOM is fully loaded before mounting the app
const rootElement = document.getElementById('root')

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error('Error initializing React application:', error)
  }
} else {
  console.error('Root element not found. Make sure there is a div with id="root" in your HTML file.')
}
