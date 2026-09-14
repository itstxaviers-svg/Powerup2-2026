import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppErrorBoundary } from './app/AppErrorBoundary'
import { TeacherApp } from './teacher/TeacherApp'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><AppErrorBoundary><TeacherApp /></AppErrorBoundary></StrictMode>,
)
