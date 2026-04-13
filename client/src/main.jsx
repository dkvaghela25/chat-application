import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SocketContextProvider } from './contexts/socketContext.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <SocketContextProvider>
    <App />
  </SocketContextProvider>
  // </StrictMode>,
)
