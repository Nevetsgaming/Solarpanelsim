import { useState } from 'react'
import Panel from './Panel'
import TopView from './TopView'
import Resistor from './Resistor'
import { parts } from '../parts'
import type { PartSettings } from '../partOptions'
import { contactGeometry, panelGeometry } from '../panelGeometry'

type CellVisualizationProps = {
  placedPartCount: number
  onPlacePart: (partId: string) => void
  onSelectPart: (partId: string) => void
  settings: PartSettings
  selectedPartId: string | null
  onReflectedPercentChange: (value: number) => void
  isSunlight: boolean
  onLightModeChange: (isSunlight: boolean) => void
}

export default function CellVisualization({ placedPartCount, onPlacePart, onSelectPart, settings, selectedPartId, onReflectedPercentChange, isSunlight, onLightModeChange }: CellVisualizationProps) {
  const [isTopView, setIsTopView] = useState(false)
  // The cross-section shows a 20 mm slice; full panel dimensions are in Top view.
  const { fingerWidthMm } = contactGeometry(settings.fingerWidth, settings.fingerSpacing)
  const fingerWidthPercent = fingerWidthMm / panelGeometry.detailWidthMm * 100
  const fingerSpacingPercent = settings.fingerSpacing / panelGeometry.detailWidthMm * 100

  return (
    <Panel id="visualization" title="Assembly" headerAction={
      <button type="button" className="view-toggle" aria-pressed={isTopView} onClick={() => setIsTopView(!isTopView)}>
        {isTopView ? 'Cross-section' : 'Top view'}
      </button>
    }>
      <div
        className="assembly-area"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          onPlacePart(event.dataTransfer.getData('text/plain'))
        }}
      >
        <button type="button" className="assembly-sun" aria-label="Sunlight options and explanation" aria-pressed={selectedPartId === 'sun'} onClick={() => onSelectPart('sun')}>☀</button>
        <div className="sun-slider option-control">
          <label htmlFor="reflectedPercent">Light reflected</label>
          <output htmlFor="reflectedPercent">{settings.reflectedPercent}%</output>
          <input
            id="reflectedPercent"
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.reflectedPercent}
            aria-valuetext={`${settings.reflectedPercent} percent`}
            onChange={(event) => onReflectedPercentChange(Number(event.target.value))}
          />
        </div>
        <div className="light-mode-controls" role="group" aria-label="Light source">
          <button type="button" aria-pressed={!isSunlight} onClick={() => { onLightModeChange(false); onSelectPart('sun') }}>Constant wavelength</button>
          <button type="button" aria-pressed={isSunlight} onClick={() => { onLightModeChange(true); onSelectPart('sun') }}>Sunlight</button>
        </div>
        <div className="assembly-status" role="status">
          <p className="assembly-hint">
            {parts[placedPartCount]
              ? `Drop ${parts[placedPartCount].name.toLowerCase()} here`
              : 'Cell assembled'}
          </p>
          {isTopView ? (
            <TopView placedPartCount={placedPartCount} settings={settings} selectedPartId={selectedPartId} onSelectPart={onSelectPart} />
          ) : (
          <>
          <div className="cell-stack">
            {parts.slice(0, placedPartCount).map((part) => (
              <div key={part.id} className="layer-row">
                <button type="button" className="layer-label" aria-pressed={selectedPartId === part.id} onClick={() => onSelectPart(part.id)}>{part.name}</button>
                {part.id === 'silicon' ? (
                  <div className="silicon" data-selected={selectedPartId === 'silicon'}>
                    <button type="button" className="silicon-emitter" aria-pressed={selectedPartId === 'emitter'} onClick={() => onSelectPart('emitter')}>n-type emitter</button>
                    <button type="button" className="silicon-base" aria-pressed={selectedPartId === 'base'} style={{ height: 40 + settings.siliconThickness * 0.4 }} onClick={() => onSelectPart('base')}>p-type base</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`cell-layer ${part.id}`}
                    aria-label={`Learn about ${part.name.toLowerCase()}`}
                    aria-pressed={selectedPartId === part.id}
                    onClick={() => onSelectPart(part.id)}
                    style={part.id === 'rear-contact'
                      ? { height: 8 + settings.rearThickness * 0.6 }
                      : part.id === 'coating'
                        ? { height: 4 + settings.coatingThickness * 0.08 }
                        : { background: `repeating-linear-gradient(90deg, #9da8b5 0 ${fingerWidthPercent}%, transparent ${fingerWidthPercent}% ${fingerSpacingPercent}%)` }}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="top-view-caption">20 mm cross-section detail · layer heights exaggerated</p>
          <div className="compact-layer-labels" aria-label="Select an assembled layer">
            {parts.slice(0, placedPartCount).reverse().map((part) => (
              <button type="button" key={part.id} aria-pressed={selectedPartId === part.id} onClick={() => onSelectPart(part.id)}>{part.name}</button>
            ))}
          </div>
          </>
          )}
          <Resistor resistance={settings.loadResistance} selected={selectedPartId === 'load'} onSelect={() => onSelectPart('load')} />
        </div>
      </div>
    </Panel>
  )
}
