import { useState } from 'react'
import Panel from './Panel'
import TopView from './TopView'
import CircuitView from './CircuitView'
import Resistor from './Resistor'
import ContactCrossSection from './ContactCrossSection'
import { parts } from '../parts'
import type { PartSettings } from '../partOptions'
import { contactSection } from '../panelGeometry'
import { wavelengthColour } from '../rendering/wavelengthColour'
import PowerReadout from './PowerReadout'
import type { ReadingTopic } from './PowerReadout'
import type { ElectricalResults, OperatingMode } from '../physics/electrical'

type CellVisualizationProps = {
  placedPartCount: number
  onSelectPart: (partId: string) => void
  settings: PartSettings
  selectedPartId: string | null
  onWavelengthChange: (value: number) => void
  isSunlight: boolean
  onLightModeChange: (isSunlight: boolean) => void
  electrical: ElectricalResults
  operatingMode: OperatingMode
  onOperatingModeChange: (mode: OperatingMode) => void
  onExplore: (topic: ReadingTopic) => void
  challengeActive: boolean
}

export default function CellVisualization({ placedPartCount, onSelectPart, settings, selectedPartId, onWavelengthChange, isSunlight, onLightModeChange, electrical, operatingMode, onOperatingModeChange, onExplore, challengeActive }: CellVisualizationProps) {
  const [view, setView] = useState<'cross-section' | 'top' | 'circuit'>('cross-section')
  const { sectionWidthMm } = contactSection(settings.fingerWidth, settings.fingerSpacing)

  return (
    <Panel id="visualization" title="Assembly" headerAction={
      <div className="view-controls" role="group" aria-label="Assembly view">
        <button type="button" aria-pressed={view === 'cross-section'} onClick={() => setView('cross-section')}>Cross-section</button>
        <button type="button" aria-pressed={view === 'top'} onClick={() => setView('top')}>Top view</button>
        <button type="button" aria-pressed={view === 'circuit'} onClick={() => setView('circuit')}>Circuit view</button>
      </div>
    }>
      <div className="canvas-readings"><PowerReadout results={electrical} mode={operatingMode} onModeChange={onOperatingModeChange} onExplore={onExplore} lockedMode={challengeActive} /></div>
      <div className="assembly-area" data-drop-zone>
        <button type="button" className="assembly-sun" style={{ color: isSunlight ? '#c49327' : wavelengthColour(settings.wavelengthNm) }} aria-label="Sunlight options and explanation" aria-pressed={selectedPartId === 'sun'} onClick={() => onSelectPart('sun')}>
          <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="13" fill="currentColor" /><path d="M32 3V10 M32 54V61 M3 32H10 M54 32H61 M11 11L16 16 M48 48L53 53 M11 53L16 48 M48 16L53 11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
        </button>
        <div className="sun-slider option-control">
          <label htmlFor="wavelengthNm">Wavelength</label>
          <output htmlFor="wavelengthNm">{isSunlight ? 'Sunlight spectrum' : `${settings.wavelengthNm} nm`}</output>
          <input id="wavelengthNm" type="range" min="300" max="1200" step="1" value={settings.wavelengthNm} disabled={isSunlight}
            aria-valuetext={`${settings.wavelengthNm} nanometres`} onChange={(event) => onWavelengthChange(Number(event.target.value))} />
        </div>
        <div className="light-mode-controls" role="group" aria-label="Light source">
          <button type="button" disabled={challengeActive} aria-pressed={!isSunlight} onClick={() => { onLightModeChange(false); onSelectPart('sun') }}>Constant wavelength</button>
          <button type="button" disabled={challengeActive} aria-pressed={isSunlight} onClick={() => { onLightModeChange(true); onSelectPart('sun') }}>Sunlight</button>
        </div>

        <div className="assembly-status">
          {view === 'circuit' ? <CircuitView results={electrical} settings={settings} mode={operatingMode} /> : placedPartCount === 0 ? (
            <div className="empty-assembly">
              <svg viewBox="0 0 80 64" aria-hidden="true"><path d="M8 22L40 6L72 22L40 38Z M8 34L40 50L72 34 M8 46L40 62L72 46" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
              <h3>Start with the rear contact</h3>
              <p>Drag it here or click it in Parts.</p>
            </div>
          ) : (
            <>
              <p className="assembly-hint" role="status">{parts[placedPartCount] ? `Next: ${parts[placedPartCount].name}` : 'Cell assembled'}</p>
              {view === 'top' ? (
                <TopView placedPartCount={placedPartCount} settings={settings} selectedPartId={selectedPartId} onSelectPart={onSelectPart} />
              ) : (
                <>
                  <div className="cell-stack">
                    {parts.slice(0, placedPartCount).map((part) => (
                      <div key={part.id} className="layer-row" data-part-id={part.id}>
                        <button type="button" className="layer-label" aria-pressed={selectedPartId === part.id} onClick={() => onSelectPart(part.id)}>{part.name}</button>
                        {part.id === 'silicon' ? (
                          <div className="silicon" data-selected={selectedPartId === 'silicon'}>
                            <button type="button" className="silicon-emitter" aria-pressed={selectedPartId === 'emitter'} onClick={() => onSelectPart('emitter')}>n-type emitter</button>
                            <button type="button" className="silicon-base" aria-pressed={selectedPartId === 'base'} style={{ height: 40 + Math.log10(settings.siliconThickness + 1) * 45 }} onClick={() => onSelectPart('base')}>p-type base</button>
                          </div>
                        ) : (
                          <button type="button" className={`cell-layer ${part.id}`}
                            aria-label={part.id === 'front-contacts' ? 'Front contacts: section across fingers between the busbars' : `Learn about ${part.name.toLowerCase()}`}
                            aria-pressed={selectedPartId === part.id} onClick={() => onSelectPart(part.id)}
                            style={part.id === 'rear-contact' ? { height: 8 + settings.rearThickness * 0.6 } : part.id === 'coating' ? { height: 4 + settings.coatingThickness * 0.08 } : undefined}>
                            {part.id === 'front-contacts' && <ContactCrossSection fingerWidth={settings.fingerWidth} fingerSpacing={settings.fingerSpacing} />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="top-view-caption">Magnified finger detail · {Number(sectionWidthMm.toFixed(1))} mm across · heights exaggerated</p>
                  <div className="compact-layer-labels" aria-label="Select an assembled layer">
                    {parts.slice(0, placedPartCount).reverse().map((part) => (
                      <button type="button" key={part.id} aria-pressed={selectedPartId === part.id} onClick={() => onSelectPart(part.id)}>{part.name}</button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {view !== 'circuit' && <Resistor resistance={settings.loadResistance} selected={selectedPartId === 'load'} onSelect={() => onSelectPart('load')} />}
        </div>
        <span className="canvas-caption">SILICON / 1 m² ACTIVE AREA</span>
      </div>
    </Panel>
  )
}
