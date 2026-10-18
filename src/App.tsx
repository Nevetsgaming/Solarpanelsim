import { useMemo, useState } from 'react'
import DesignPanel from './components/DesignPanel'
import CellVisualization from './components/CellVisualization'
import LearningPanel from './components/LearningPanel'
import { parts } from './parts'
import { defaultSettings } from './partOptions'
import type { SettingName } from './partOptions'
import { minimumFingerSpacing } from './panelGeometry'
import { calculateElectrical } from './physics/electrical'
import type { OperatingMode } from './physics/electrical'
import FormulaExplorer from './components/FormulaExplorer'
import './App.css'

// App arranges the page. Each panel owns its own content.
function App() {
  const [placedPartCount, setPlacedPartCount] = useState(0)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [settings, setSettings] = useState(defaultSettings)
  const [isSunlight, setIsSunlight] = useState(false)
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('mpp')
  const [isFormulaOpen, setIsFormulaOpen] = useState(false)
  const electrical = useMemo(() => calculateElectrical(settings, isSunlight, placedPartCount === parts.length), [settings, isSunlight, placedPartCount])

  function changeSetting(name: SettingName, value: number) {
    if (name === 'loadResistance') setOperatingMode('load')
    setSettings((current) => {
      const next = { ...current, [name]: value }
      next.fingerSpacing = Math.max(next.fingerSpacing, minimumFingerSpacing(next.fingerWidth))
      return next
    })
  }

  function resetAssembly() {
    setPlacedPartCount(0)
    setSelectedPartId(null)
    setSettings(defaultSettings)
    setIsSunlight(false)
    setOperatingMode('mpp')
  }

  function undoLayer() {
    if (placedPartCount === 0) return
    setPlacedPartCount(placedPartCount - 1)
    setSelectedPartId(parts[placedPartCount - 2]?.id ?? null)
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
        <h1 className="brand"><span className="brand-mark" aria-hidden="true">☀</span>Solar Cell Lab</h1>
        <span className="project-meta">Silicon <span aria-hidden="true">/</span> 1 m × 1 m</span>
      </header>
      <main>
        <div className="workspace">
          <DesignPanel placedPartCount={placedPartCount} onPlacePart={placePart} onSelectPart={setSelectedPartId} selectedPartId={selectedPartId} settings={settings} onSettingChange={changeSetting} onReset={resetAssembly} isSunlight={isSunlight} onUndo={undoLayer} electrical={electrical} operatingMode={operatingMode} onOperatingModeChange={setOperatingMode} onExplorePower={() => setIsFormulaOpen(true)} />
          <CellVisualization placedPartCount={placedPartCount} onSelectPart={setSelectedPartId} settings={settings} selectedPartId={selectedPartId} onWavelengthChange={(value) => changeSetting('wavelengthNm', value)} isSunlight={isSunlight} onLightModeChange={setIsSunlight} />
          <LearningPanel selectedPartId={selectedPartId} settings={settings} hasSilicon={placedPartCount >= 2} hasCoating={placedPartCount >= 3} isSunlight={isSunlight} electrical={electrical} />
        </div>
      </main>
      {isFormulaOpen && <FormulaExplorer results={electrical} operating={operatingMode === 'mpp' ? electrical.mpp : electrical.load} settings={settings} isSunlight={isSunlight} onClose={() => setIsFormulaOpen(false)} />}
      
    </div>
  )
}

export default App
