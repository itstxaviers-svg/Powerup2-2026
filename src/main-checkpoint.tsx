import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppErrorBoundary } from './app/AppErrorBoundary'
import { CheckpointApp } from './checkpoint/CheckpointApp'
import './styles.css'
import './checkpoint/checkpoint.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><CheckpointApp /></AppErrorBoundary>
  </StrictMode>,
)
