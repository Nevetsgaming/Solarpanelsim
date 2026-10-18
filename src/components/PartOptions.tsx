import { learningTopics } from '../parts'
import { partOptions } from '../partOptions'
import type { PartSettings, SettingName } from '../partOptions'
import { contactGeometry, minimumFingerSpacing, panelGeometry } from '../panelGeometry'

type PartOptionsProps = {
  selectedPartId: string | null
  settings: PartSettings
  onSettingChange: (name: SettingName, value: number) => void
  isSunlight: boolean
}

export default function PartOptions({ selectedPartId, settings, onSettingChange, isSunlight }: PartOptionsProps) {
  // The emitter and base are regions of the same silicon part.
  const partId = selectedPartId === 'emitter' || selectedPartId === 'base' ? 'silicon' : selectedPartId
  const selectedPart = learningTopics.find((part) => part.id === partId)
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
            min={option.logarithmic ? Math.log10(option.min) : option.key === 'fingerSpacing' ? minimumFingerSpacing(settings.fingerWidth) : option.min}
            max={option.logarithmic ? Math.log10(option.max) : option.max}
            step={option.logarithmic ? 0.01 : option.step}
            value={option.logarithmic ? Math.log10(settings[option.key]) : settings[option.key]}
            aria-valuetext={`${settings[option.key]} ${option.unit}`}
            onChange={(event) => onSettingChange(option.key, option.logarithmic ? Number((10 ** Number(event.target.value)).toPrecision(4)) : Number(event.target.value))}
          />
        </div>
      )) : <p>Select a part to see its options.</p>}
      {partId === 'front-contacts' && (
        <p>{contactGeometry(settings.fingerWidth, settings.fingerSpacing).fingerCount} fingers across 1 m. Fixed finger height: {panelGeometry.fingerHeightUm} µm. Two {panelGeometry.busbarWidthMm} mm busbars.</p>
      )}
      {partId === 'silicon' && <p>Fixed emitter depth: {panelGeometry.emitterThicknessUm} µm.</p>}
      {options && <p>{partId === 'sun'
        ? isSunlight ? 'Sunlight contains many wavelengths. Switch to Constant wavelength to use the slider beside the sun.' : 'Adjust wavelength beside the sun. Optical power stays fixed.'
        : partId === 'load'
          ? 'Adjusting resistance switches to resistor-load operation. The logarithmic slider spans 0.0001–100 Ω; maximum-power mode uses an ideal controller instead.'
        : partId === 'silicon'
          ? 'Thickness changes single-pass absorption. Drawing not to scale.'
        : partId === 'coating'
          ? 'Reflection is a chosen optical loss. Thickness changes the drawing independently; it does not predict reflection.'
        : partId === 'front-contacts'
          ? 'Maximum width: 10 cm (100,000 µm). Spacing increases if needed to keep fingers separate. Top view includes a magnified detail.'
          : 'Visual adjustments only. Thicknesses exaggerated for visibility.'}</p>}
    </section>
  )
}
