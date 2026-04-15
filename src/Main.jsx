import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './store/authStore'
import { InventoryProvider } from './store/inventoryStore'
import { ToastProvider } from './store/toastStore'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <InventoryProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </InventoryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)