import { useMemo, useState } from 'react'
import DesignPanel from './components/DesignPanel'
import CellVisualization from './components/CellVisualization'
import LearningPanel from './components/LearningPanel'
import { parts } from './parts'
import { defaultSettings } from './partOptions'
import type { SettingName } from './partOptions'
import { calculateElectrical } from './physics/electrical'
import type { OperatingMode } from './physics/electrical'
import FormulaExplorer from './components/FormulaExplorer'
import type { ReadingTopic } from './components/PowerReadout'
import type { DesignSnapshot } from './experiments'
import ExperimentPanel from './components/ExperimentPanel'
import IVCurve from './components/IVCurve'
import './App.css'

// App arranges the page. Each panel owns its own content.
function App() {
  const [placedPartCount, setPlacedPartCount] = useState(0)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [settings, setSettings] = useState(defaultSettings)
  const [isSunlight, setIsSunlight] = useState(false)
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('mpp')
  const [formulaTopic, setFormulaTopic] = useState<ReadingTopic | null>(null)
  const [previous, setPrevious] = useState<DesignSnapshot | null>(null)
  const [saved, setSaved] = useState<DesignSnapshot | null>(null)
  const [challengeBaseline, setChallengeBaseline] = useState<number | null>(null)
  const challengeActive = challengeBaseline !== null
  const electrical = useMemo(() => calculateElectrical(settings, isSunlight, placedPartCount === parts.length), [settings, isSunlight, placedPartCount])
  const current: DesignSnapshot = { settings: { ...settings }, isSunlight, mode: operatingMode, results: electrical }

  function changeSetting(name: SettingName, value: number) {
    if (challengeActive && name !== 'fingerWidth') return
    if (settings[name] === value) return
    setPrevious(current)
    if (name === 'loadResistance') setOperatingMode('load')
    setSettings((current) => ({ ...current, [name]: value }))
  }

  function resetAssembly() {
    setChallengeBaseline(null)
    setPrevious(null)
    setPlacedPartCount(0)
    setSelectedPartId(null)
    setSettings(defaultSettings)
    setIsSunlight(false)
    setOperatingMode('mpp')
  }

  function undoLayer() {
    setChallengeBaseline(null)
    setPrevious(null)
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

  function changeLightMode(value: boolean) {
    if (challengeActive || value === isSunlight) return
    setPrevious(current)
    setIsSunlight(value)
  }

  function changeOperatingMode(mode: OperatingMode) {
    if (challengeActive || mode === operatingMode) return
    setPrevious(current)
    setOperatingMode(mode)
  }

  function startChallenge() {
    setSettings({ ...defaultSettings })
    setPlacedPartCount(parts.length)
    setIsSunlight(true)
    setOperatingMode('mpp')
    setSelectedPartId('front-contacts')
    setPrevious(null)
    setChallengeBaseline(calculateElectrical(defaultSettings, true, true).mpp.power)
  }

  function restoreSaved() {
    if (!saved || challengeActive) return
    setPrevious(current)
    setSettings({ ...saved.settings })
    setIsSunlight(saved.isSunlight)
    setOperatingMode(saved.mode)
    setPlacedPartCount(parts.length)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="brand"><span className="brand-mark" aria-hidden="true">☀</span>Solar Cell Lab</h1>
        <span className="project-meta">Silicon <span aria-hidden="true">/</span> 1 m × 1 m</span>
      </header>
      <main>
        <div className="workspace">
          <DesignPanel placedPartCount={placedPartCount} onPlacePart={placePart} onSelectPart={setSelectedPartId} selectedPartId={selectedPartId} settings={settings} onSettingChange={changeSetting} onReset={resetAssembly} isSunlight={isSunlight} onUndo={undoLayer} electrical={electrical} challengeActive={challengeActive} />
          <CellVisualization placedPartCount={placedPartCount} onSelectPart={setSelectedPartId} settings={settings} selectedPartId={selectedPartId} onWavelengthChange={(value) => changeSetting('wavelengthNm', value)} isSunlight={isSunlight} onLightModeChange={changeLightMode} electrical={electrical} operatingMode={operatingMode} onOperatingModeChange={changeOperatingMode} onExplore={setFormulaTopic} challengeActive={challengeActive} />
          <LearningPanel selectedPartId={selectedPartId} settings={settings} hasSilicon={placedPartCount >= 2} hasCoating={placedPartCount >= 3} isSunlight={isSunlight} electrical={electrical}
            experiment={<ExperimentPanel current={current} previous={previous} saved={saved} challengeBaseline={challengeBaseline} onSave={() => { if (electrical.assembled && !challengeActive) setSaved(current) }} onRestore={restoreSaved} onChallenge={startChallenge} onEndChallenge={() => setChallengeBaseline(null)} />}
            curve={<IVCurve results={electrical} mode={operatingMode} />} />
        </div>
      </main>
      {formulaTopic && <FormulaExplorer topic={formulaTopic} mode={operatingMode} results={electrical} operating={operatingMode === 'mpp' ? electrical.mpp : electrical.load} settings={settings} isSunlight={isSunlight} onClose={() => setFormulaTopic(null)} />}
      
    </div>
  )
}

export default App
