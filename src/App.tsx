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

      </header>
      <main>
        <div className="workspace-heading">

    
        </div>
        <div className="workspace">
          <DesignPanel />
          <CellVisualization />
          <LearningPanel />
        </div>
      </main>
      
    </div>
  )
}

export default App
