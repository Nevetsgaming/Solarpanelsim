import Panel from './Panel'
import { parts } from '../parts'
import PartOptions from './PartOptions'
import PartButton from './PartButton'
import type { ElectricalResults } from '../physics/electrical'
import type { PartSettings, SettingName } from '../partOptions'

type DesignPanelProps = {
  placedPartCount: number
  onPlacePart: (partId: string) => void
  selectedPartId: string | null
  settings: PartSettings
  onSettingChange: (name: SettingName, value: number) => void
  onReset: () => void
  isSunlight: boolean
  onUndo: () => void
  electrical: ElectricalResults
  challengeActive: boolean
}

export default function DesignPanel({ placedPartCount, onPlacePart, selectedPartId, settings, onSettingChange, onReset, isSunlight, onUndo, electrical, challengeActive }: DesignPanelProps) {
  const selectedPart = selectedPartId === 'emitter' || selectedPartId === 'base' ? 'silicon' : selectedPartId
  return (
    <Panel id="design" title="Parts" headerAction={<span className="panel-meta">{placedPartCount} / {parts.length} placed</span>}>
      <div className="parts-list">
        {parts.map((part, index) => (
          <PartButton
            key={part.id}
            id={part.id}
            name={part.name}
            selected={selectedPart === part.id}
            canPlace={index === placedPartCount}
            placed={index < placedPartCount}
            onActivate={() => onPlacePart(part.id)}
          />
        ))}
        <p className="part-hint">Click or drag to build. Switch to Learn to explore.</p>
      </div>
      <PartOptions selectedPartId={selectedPartId} settings={settings} onSettingChange={onSettingChange} isSunlight={isSunlight} electrical={electrical} challengeActive={challengeActive} />
      <details className="assembly-rule"><summary>Assembly help</summary><p>Add all four layers to start this experiment. The coating improves light entry; it is not the source of electricity.</p></details>
      <div className="assembly-actions">
        <button type="button" className="reset-button" onClick={onUndo} disabled={placedPartCount === 0}>Undo layer</button>
        <button type="button" className="reset-button" onClick={onReset}>Reset</button>
      </div>
    </Panel>
  )
}
