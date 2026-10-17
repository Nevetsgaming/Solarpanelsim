import { useState } from 'react'
import DesignPanel from './components/DesignPanel'
import CellVisualization from './components/CellVisualization'
import LearningPanel from './components/LearningPanel'
import './App.css'

// App arranges the page. Each panel owns its own content.
function App() {
  const [hasRearContact, setHasRearContact] = useState(false)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark" aria-hidden="true">☀</span>Solar Cell Lab</div>

      </header>
      <main>
        <div className="workspace">
          <DesignPanel hasRearContact={hasRearContact} onPlaceRearContact={() => setHasRearContact(true)} />
          <CellVisualization hasRearContact={hasRearContact} onPlaceRearContact={() => setHasRearContact(true)} />
          <LearningPanel />
        </div>
      </main>
      
    </div>
  )
}

export default App
