import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './utils/index.css'
import './i18n'
import App from './utils/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
