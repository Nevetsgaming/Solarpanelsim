import { useState } from 'react'
import DesignPanel from './components/DesignPanel'
import CellVisualization from './components/CellVisualization'
import LearningPanel from './components/LearningPanel'
import { parts } from './parts'
import './App.css'

// App arranges the page. Each panel owns its own content.
function App() {
  const [placedPartCount, setPlacedPartCount] = useState(0)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)

  function placePart(partId: string) {
    if (!parts.some((part) => part.id === partId)) return
    setSelectedPartId(partId)
    // Only the next layer can be placed, so layers cannot be skipped or duplicated.
    setPlacedPartCount((count) => parts[count]?.id === partId ? count + 1 : count)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark" aria-hidden="true">☀</span>Solar Cell Lab</div>

      </header>
      <main>
        <div className="workspace">
          <DesignPanel placedPartCount={placedPartCount} onPlacePart={placePart} />
          <CellVisualization placedPartCount={placedPartCount} onPlacePart={placePart} onSelectPart={setSelectedPartId} />
          <LearningPanel selectedPartId={selectedPartId} />
        </div>
      </main>
      
    </div>
  )
}

export default App
