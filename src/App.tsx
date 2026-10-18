import { useMemo, useState } from 'react'
import DesignPanel from './components/DesignPanel'
import CellVisualization from './components/CellVisualization'
import LearningPanel from './components/LearningPanel'
import { parts } from './parts'
import { defaultSettings } from './partOptions'
import type { SettingName } from './partOptions'
import { calculateElectrical } from './physics/electrical'
import FormulaExplorer from './components/FormulaExplorer'
import type { ReadingTopic } from './components/PowerReadout'
import type { DesignSnapshot } from './experiments'
import ExperimentPanel from './components/ExperimentPanel'
import './App.css'

// App arranges the page. Each panel owns its own content.
function App() {
  const [placedPartCount, setPlacedPartCount] = useState(0)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [settings, setSettings] = useState(defaultSettings)
  const [isSunlight, setIsSunlight] = useState(true)
  const [formulaTopic, setFormulaTopic] = useState<ReadingTopic | null>(null)
  const [workspaceMode, setWorkspaceMode] = useState<'build' | 'learn'>('build')
  const [previous, setPrevious] = useState<DesignSnapshot | null>(null)
  const [saved, setSaved] = useState<DesignSnapshot | null>(null)
  const [challengeBaseline, setChallengeBaseline] = useState<number | null>(null)
  const challengeActive = challengeBaseline !== null
  const electrical = useMemo(() => calculateElectrical(settings, isSunlight, placedPartCount === parts.length), [settings, isSunlight, placedPartCount])
  const current: DesignSnapshot = { settings: { ...settings }, isSunlight, mode: 'mpp', results: electrical }

  function changeSetting(name: SettingName, value: number) {
    if (challengeActive && name !== 'fingerWidth') return
    if (settings[name] === value) return
    setPrevious(current)
    setSettings((current) => ({ ...current, [name]: value }))
  }

  function resetAssembly() {
    setChallengeBaseline(null)
    setPrevious(null)
    setPlacedPartCount(0)
    setSelectedPartId(null)
    setSettings(defaultSettings)
    setIsSunlight(true)
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

  function startChallenge() {
    setSettings({ ...defaultSettings })
    setPlacedPartCount(parts.length)
    setIsSunlight(true)
    setSelectedPartId('front-contacts')
    setPrevious(null)
    setChallengeBaseline(calculateElectrical(defaultSettings, true, true).mpp.power)
  }

  function restoreSaved() {
    if (!saved || challengeActive) return
    setPrevious(current)
    setSettings({ ...saved.settings })
    setIsSunlight(saved.isSunlight)
    setPlacedPartCount(parts.length)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="brand"><span className="brand-mark" aria-hidden="true">☀</span>Solar Cell Lab</h1>
        <nav className="workspace-modes" aria-label="Workspace mode">
          <button type="button" aria-pressed={workspaceMode === 'build'} onClick={() => setWorkspaceMode('build')}>Build</button>
          <button type="button" aria-pressed={workspaceMode === 'learn'} onClick={() => setWorkspaceMode('learn')}>Learn</button>
        </nav>
        <span className="project-meta">Silicon <span aria-hidden="true">/</span> 1 m × 1 m</span>
      </header>
      <main>
        <div className="workspace" data-mode={workspaceMode}>
          <DesignPanel placedPartCount={placedPartCount} onPlacePart={placePart} selectedPartId={selectedPartId} settings={settings} onSettingChange={changeSetting} onReset={resetAssembly} isSunlight={isSunlight} onUndo={undoLayer} electrical={electrical} challengeActive={challengeActive} />
          <CellVisualization placedPartCount={placedPartCount} onSelectPart={setSelectedPartId} settings={settings} selectedPartId={selectedPartId} onWavelengthChange={(value) => changeSetting('wavelengthNm', value)} isSunlight={isSunlight} onLightModeChange={changeLightMode} electrical={electrical} onExplore={(topic) => { setWorkspaceMode('learn'); setFormulaTopic(topic) }} challengeActive={challengeActive} learnMode={workspaceMode === 'learn'} />
          {workspaceMode === 'learn' && <LearningPanel selectedPartId={selectedPartId} settings={settings} hasSilicon={placedPartCount >= 2} hasCoating={placedPartCount >= 3} isSunlight={isSunlight} electrical={electrical}
            experiment={<ExperimentPanel current={current} previous={previous} saved={saved} challengeBaseline={challengeBaseline} onSave={() => { if (electrical.assembled && !challengeActive) setSaved(current) }} onRestore={restoreSaved} onChallenge={startChallenge} onEndChallenge={() => setChallengeBaseline(null)} />}
            />}
        </div>
      </main>
      {formulaTopic && <FormulaExplorer topic={formulaTopic} mode="mpp" results={electrical} operating={electrical.mpp} settings={settings} isSunlight={isSunlight} onClose={() => setFormulaTopic(null)} />}
      
    </div>
  )
}

export default App
