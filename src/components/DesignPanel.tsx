import Panel from './Panel'
import { parts } from '../parts'
import PartOptions from './PartOptions'
import PartButton from './PartButton'
import PowerReadout from './PowerReadout'
import type { ElectricalResults, OperatingMode } from '../physics/electrical'
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
  onUndo: () => void
  electrical: ElectricalResults
  operatingMode: OperatingMode
  onOperatingModeChange: (mode: OperatingMode) => void
  onExplorePower: () => void
}

export default function DesignPanel({ placedPartCount, onPlacePart, onSelectPart, selectedPartId, settings, onSettingChange, onReset, isSunlight, onUndo, electrical, operatingMode, onOperatingModeChange, onExplorePower }: DesignPanelProps) {
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
        <button type="button" className="part load-part" aria-pressed={selectedPartId === 'load'} onClick={() => onSelectPart('load')}><span className="load-symbol" aria-hidden="true">Ω</span><span className="part-name">Load resistance</span></button>
        <p className="part-hint">Drag the next part into the canvas, or click to place. Select any part to inspect it.</p>
      </div>
      <PartOptions selectedPartId={selectedPartId} settings={settings} onSettingChange={onSettingChange} isSunlight={isSunlight} />
      <div className="assembly-actions">
        <button type="button" className="reset-button" onClick={onUndo} disabled={placedPartCount === 0}>Undo layer</button>
        <button type="button" className="reset-button" onClick={onReset}>Reset</button>
      </div>
      <PowerReadout results={electrical} mode={operatingMode} onModeChange={onOperatingModeChange} onExplore={onExplorePower} />
    </Panel>
  )
}
