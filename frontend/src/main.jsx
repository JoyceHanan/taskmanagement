import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#e8e8ea',
            border: '1px solid #2a2a2e',
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#a8ff78', secondary: '#0e0e10' } },
          error:   { iconTheme: { primary: '#ff6b6b', secondary: '#0e0e10' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)