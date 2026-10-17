import { parts } from '../parts'
import { partOptions } from '../partOptions'
import type { PartSettings, SettingName } from '../partOptions'

type PartOptionsProps = {
  selectedPartId: string | null
  settings: PartSettings
  onSettingChange: (name: SettingName, value: number) => void
}

export default function PartOptions({ selectedPartId, settings, onSettingChange }: PartOptionsProps) {
  // The emitter and base are regions of the same silicon part.
  const partId = selectedPartId === 'emitter' || selectedPartId === 'base' ? 'silicon' : selectedPartId
  const selectedPart = parts.find((part) => part.id === partId)
  const options = partId ? partOptions[partId] : undefined

  return (
    <section className="part-options" aria-labelledby="options-title">
      <h3 id="options-title">{selectedPart ? `${selectedPart.name} options` : 'Part options'}</h3>
      {options ? options.map((option) => (
        <div className="option-control" key={option.key}>
          <label htmlFor={option.key}>{option.label}</label>
          <output htmlFor={option.key}>{settings[option.key]} {option.unit}</output>
          <input
            id={option.key}
            type="range"
            min={option.min}
            max={option.max}
            step={option.step}
            value={settings[option.key]}
            aria-valuetext={`${settings[option.key]} ${option.unit}`}
            onChange={(event) => onSettingChange(option.key, Number(event.target.value))}
          />
        </div>
      )) : <p>Select a part to see its options.</p>}
      {options && <p>Visual adjustments only. Layer thicknesses are exaggerated for visibility.</p>}
    </section>
  )
}
