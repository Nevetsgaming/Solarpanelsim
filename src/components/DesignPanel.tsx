import Panel from './Panel'
import { parts } from '../parts'
import PartOptions from './PartOptions'
import type { PartSettings, SettingName } from '../partOptions'

type DesignPanelProps = {
  placedPartCount: number
  onPlacePart: (partId: string) => void
  onSelectPart: (partId: string) => void
  selectedPartId: string | null
  settings: PartSettings
  onSettingChange: (name: SettingName, value: number) => void
  onReset: () => void
  isSunlight: boolean
}

export default function DesignPanel({ placedPartCount, onPlacePart, onSelectPart, selectedPartId, settings, onSettingChange, onReset, isSunlight }: DesignPanelProps) {
  const selectedPart = selectedPartId === 'emitter' || selectedPartId === 'base' ? 'silicon' : selectedPartId
  return (
    <Panel id="design" title="Parts">
      <div className="parts-list">
        {parts.map((part, index) => (
          <button
            key={part.id}
            className="part"
            type="button"
            aria-pressed={selectedPart === part.id}
            draggable={index === placedPartCount}
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', part.id)
              event.dataTransfer.effectAllowed = 'copy'
            }}
            onClick={() => onPlacePart(part.id)}
          >
            {part.name}
          </button>
        ))}
        <button type="button" className="part" aria-pressed={selectedPartId === 'load'} onClick={() => onSelectPart('load')}>Load resistance</button>
        <p className="part-hint">Click a part to learn. Drag or click the next part to place it.</p>
      </div>
      <PartOptions selectedPartId={selectedPartId} settings={settings} onSettingChange={onSettingChange} isSunlight={isSunlight} />
      <button type="button" className="reset-button" onClick={onReset}>Reset assembly</button>
      <div className="power-box">
        <h3>Power</h3>
        <p className="power-value" aria-label="Power not yet calculated">— <span>W</span></p>
        <div className="electrical-readings">
          <div><h3>Current</h3><p aria-label="Current not yet calculated">— A</p></div>
          <div><h3>Voltage</h3><p aria-label="Voltage not yet calculated">— V</p></div>
        </div>
      </div>
    </Panel>
  )
}
