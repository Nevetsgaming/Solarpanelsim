import { useState } from 'react'
import Panel from './Panel'
import TopView from './TopView'
import Resistor from './Resistor'
import { parts } from '../parts'
import type { PartSettings } from '../partOptions'

const wavelengthColourStops: [number, string][] = [
  [300, '#542b9b'],
  [380, '#7800ff'],
  [440, '#0000ff'],
  [490, '#00dfff'],
  [510, '#00e600'],
  [580, '#ffff00'],
  [645, '#ff0000'],
  [700, '#ff3b16'],
  [1200, '#87351f'],
]

function wavelengthColour(wavelengthNm: number) {
  const upperIndex = wavelengthColourStops.findIndex(([wavelength]) => wavelength >= wavelengthNm)
  const lower = wavelengthColourStops[Math.max(0, upperIndex - 1)]
  const upper = wavelengthColourStops[upperIndex < 0 ? wavelengthColourStops.length - 1 : upperIndex]
  const fraction = upper[0] === lower[0] ? 0 : (wavelengthNm - lower[0]) / (upper[0] - lower[0])
  const lowerRgb = lower[1].slice(1).match(/.{2}/g)!.map((channel) => Number.parseInt(channel, 16))
  const upperRgb = upper[1].slice(1).match(/.{2}/g)!.map((channel) => Number.parseInt(channel, 16))
  return `#${lowerRgb.map((channel, index) => Math.round(channel + (upperRgb[index] - channel) * fraction).toString(16).padStart(2, '0')).join('')}`
}

type CellVisualizationProps = {
  placedPartCount: number
  onPlacePart: (partId: string) => void
  onSelectPart: (partId: string) => void
  settings: PartSettings
  selectedPartId: string | null
}

export default function CellVisualization({ placedPartCount, onPlacePart, onSelectPart, settings, selectedPartId }: CellVisualizationProps) {
  const [isTopView, setIsTopView] = useState(false)
  // Map physical settings to readable drawing sizes. This is not a scale drawing.
  const fingerWidthPx = settings.fingerWidth / 1000 * 60
  const fingerSpacingPx = settings.fingerSpacing * 60
  const lightColour = wavelengthColour(settings.wavelengthNm)

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
        <div className="assembly-status" role="status">
          <p className="assembly-hint">
            {parts[placedPartCount]
              ? `Drop ${parts[placedPartCount].name.toLowerCase()} here`
              : 'Cell assembled'}
          </p>
          <svg className="sunlight-waves" viewBox="0 0 160 64" aria-hidden="true" style={{ color: lightColour }}>
            <path d="M 40 0 C 20 16 60 24 40 40 S 60 56 40 64" />
            <path d="M 80 0 C 60 16 100 24 80 40 S 100 56 80 64" />
            <path d="M 120 0 C 100 16 140 24 120 40 S 140 56 120 64" />
          </svg>
          {isTopView ? (
            <TopView placedPartCount={placedPartCount} settings={settings} selectedPartId={selectedPartId} onSelectPart={onSelectPart} />
          ) : (
          <>
          <div className="cell-stack">
            {parts.map((part, index) => {
              const isPlaced = index < placedPartCount
              const placeholderHeight = part.id === 'rear-contact'
                ? 8 + settings.rearThickness * 0.6
                : part.id === 'silicon'
                  ? 72 + settings.siliconThickness * 0.4
                  : part.id === 'coating'
                    ? 4 + settings.coatingThickness * 0.08
                    : 26

              return (
              <div key={part.id} className="layer-row">
                {isPlaced
                  ? <button type="button" className="layer-label" aria-pressed={selectedPartId === part.id} onClick={() => onSelectPart(part.id)}>{part.name}</button>
                  : <span className="layer-label layer-slot-label">{part.name}</span>}
                {!isPlaced ? (
                  <div className={`layer-slot ${part.id}`} style={{ height: placeholderHeight }} aria-hidden="true" />
                ) : part.id === 'silicon' ? (
                  <div className="silicon" data-selected={selectedPartId === 'silicon'}>
                    <button type="button" className="silicon-emitter" aria-pressed={selectedPartId === 'emitter'} onClick={() => onSelectPart('emitter')}>n-type emitter</button>
                    <button type="button" className="silicon-base" aria-pressed={selectedPartId === 'base'} style={{ height: 40 + settings.siliconThickness * 0.4 }} onClick={() => onSelectPart('base')}>p-type base</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`cell-layer ${part.id}`}
                    aria-label={`Learn about ${part.name.toLowerCase()}`}
              )
            })}
                    onClick={() => onSelectPart(part.id)}
                    style={part.id === 'rear-contact'
                      ? { height: 8 + settings.rearThickness * 0.6 }
                      : part.id === 'coating'
                        ? { height: 4 + settings.coatingThickness * 0.08 }
                        : { background: `repeating-linear-gradient(90deg, #9da8b5 0 ${fingerWidthPx}px, transparent ${fingerWidthPx}px ${fingerSpacingPx}px)` }}
                  />
                )}
              </div>
            ))}
          </div>
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
