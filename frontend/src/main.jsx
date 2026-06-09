import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'  //DOM oda connect panna use pannuvom.
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
