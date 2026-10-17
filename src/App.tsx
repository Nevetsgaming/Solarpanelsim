import { useState } from 'react'
import DesignPanel from './components/DesignPanel'
import CellVisualization from './components/CellVisualization'
import LearningPanel from './components/LearningPanel'
import { parts } from './parts'
import { defaultSettings } from './partOptions'
import type { SettingName } from './partOptions'
import './App.css'

// App arranges the page. Each panel owns its own content.
function App() {
  const [placedPartCount, setPlacedPartCount] = useState(0)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [settings, setSettings] = useState(defaultSettings)

  function changeSetting(name: SettingName, value: number) {
    setSettings((current) => ({ ...current, [name]: value }))
  }

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
          <DesignPanel placedPartCount={placedPartCount} onPlacePart={placePart} selectedPartId={selectedPartId} settings={settings} onSettingChange={changeSetting} />
          <CellVisualization placedPartCount={placedPartCount} onPlacePart={placePart} onSelectPart={setSelectedPartId} settings={settings} />
          <LearningPanel selectedPartId={selectedPartId} />
        </div>
      </main>
      
    </div>
  )
}

export default App
