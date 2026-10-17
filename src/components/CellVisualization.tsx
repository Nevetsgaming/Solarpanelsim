import Panel from './Panel'
import { parts } from '../parts'
import type { PartSettings } from '../partOptions'

type CellVisualizationProps = {
  placedPartCount: number
  onPlacePart: (partId: string) => void
  onSelectPart: (partId: string) => void
  settings: PartSettings
}

export default function CellVisualization({ placedPartCount, onPlacePart, onSelectPart, settings }: CellVisualizationProps) {
  // Map physical settings to readable drawing sizes. This is not a scale drawing.
  const fingerWidthPx = settings.fingerWidth / 1000 * 60
  const fingerSpacingPx = settings.fingerSpacing * 60

  return (
    <Panel id="visualization" title="Assembly">
      <div
        className="assembly-area"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          onPlacePart(event.dataTransfer.getData('text/plain'))
        }}
      >
        <button type="button" className="assembly-sun" aria-label="Learn about sunlight" onClick={() => onSelectPart('sun')}>☀</button>
        <div className="assembly-status" role="status">
          <p className="assembly-hint">
            {parts[placedPartCount]
              ? `Drop ${parts[placedPartCount].name.toLowerCase()} here`
              : 'Cell assembled'}
          </p>
          <div className="cell-stack">
            {parts.slice(0, placedPartCount).map((part) => (
              <div key={part.id} className="layer-row">
                <button type="button" className="layer-label" onClick={() => onSelectPart(part.id)}>{part.name}</button>
                {part.id === 'silicon' ? (
                  <div className="silicon">
                    <button type="button" className="silicon-emitter" onClick={() => onSelectPart('emitter')}>n-type emitter</button>
                    <button type="button" className="silicon-base" style={{ height: 40 + settings.siliconThickness * 0.4 }} onClick={() => onSelectPart('base')}>p-type base</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`cell-layer ${part.id}`}
                    aria-label={`Learn about ${part.name.toLowerCase()}`}
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
        </div>
      </div>
    </Panel>
  )
}
