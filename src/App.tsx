import DesignPanel from './components/DesignPanel'
import CellVisualization from './components/CellVisualization'
import LearningPanel from './components/LearningPanel'
import './App.css'

// App arranges the page. Each panel owns its own content.
function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark" aria-hidden="true">☀</span>Solar Cell Lab</div>
        <span className="header-caption">An experiment in light & electricity</span>
      </header>
      <main>
        <div className="workspace-heading">
          <div><p className="eyebrow">THE SILICON EXPERIMENT</p><h1>Small changes. New discoveries.</h1></div>
          <p>Design a cell. Explore the physics.</p>
        </div>
        <div className="workspace">
          <DesignPanel />
          <CellVisualization />
          <LearningPanel />
        </div>
      </main>
      <footer className="app-footer">Built to explore <span>Silicon · Monochromatic light</span></footer>
    </div>
  )
}

export default App
