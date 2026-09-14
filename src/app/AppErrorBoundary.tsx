import { Component, type ErrorInfo, type ReactNode } from 'react'

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Keep the learner on a recoverable themed screen. Diagnostics can be
    // connected here when a production error service exists.
  }

  render() {
    if (!this.state.failed) return this.props.children
    return <main className="fallback-shell"><section className="awaiting-card"><p className="eyebrow">Lightworld safety system</p><h1>This station needs a quick restart</h1><p>Your saved progress is safe. Reload the app to reconnect the world controls.</p><button className="primary-button" type="button" onClick={() => window.location.reload()}>Reload Lightworld</button></section></main>
  }
}
