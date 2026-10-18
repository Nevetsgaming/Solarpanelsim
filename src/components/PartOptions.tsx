import { learningTopics } from '../parts'
import { partOptions } from '../partOptions'
import type { PartSettings, SettingName } from '../partOptions'
import { contactGeometry, panelGeometry } from '../panelGeometry'
import type { ElectricalResults } from '../physics/electrical'

type PartOptionsProps = {
  selectedPartId: string | null
  settings: PartSettings
  onSettingChange: (name: SettingName, value: number) => void
  isSunlight: boolean
  electrical: ElectricalResults
}

export default function PartOptions({ selectedPartId, settings, onSettingChange, isSunlight, electrical }: PartOptionsProps) {
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
            min={option.logarithmic ? Math.log10(option.min) : option.min}
            max={option.logarithmic ? Math.log10(option.max) : option.max}
            step={option.logarithmic ? 0.01 : option.step}
            value={option.logarithmic ? Math.log10(settings[option.key]) : settings[option.key]}
            aria-valuetext={`${settings[option.key]} ${option.unit}`}
            onChange={(event) => onSettingChange(option.key, option.logarithmic ? Number((10 ** Number(event.target.value)).toPrecision(4)) : Number(event.target.value))}
          />
          {option.key === 'fingerWidth' && (
            <div className="contact-feedback">
              <dl>
                <div><dt>Light blocked by contacts</dt><dd>{((1 - electrical.unshadedFraction) * 100).toFixed(2)}%</dd></div>
                <div><dt>Finger resistance</dt><dd>{electrical.fingerResistance.toExponential(2)} Ω</dd></div>
              </dl>
              <p>Wider fingers block more sunlight, but give current an easier path. Watch the two readings as you change the width.</p>
              <p>Can you find a width that produces more power? Check the power box on the right.</p>
            </div>
          )}
        </div>
      )) : <p>Select a part to see its options.</p>}
      {partId === 'front-contacts' && (
        <p>{contactGeometry(settings.fingerWidth, settings.fingerSpacing).fingerCount} fingers across 1 m. Fixed finger height: {panelGeometry.fingerHeightUm} µm. Two {panelGeometry.busbarWidthMm} mm busbars.</p>
      )}
      {partId === 'silicon' && <p>Fixed emitter depth: {panelGeometry.emitterThicknessUm} µm.</p>}
      {options && <p>{partId === 'sun'
        ? isSunlight ? 'Sunlight mixes many wavelengths together. Choose Constant wavelength if you want to explore one at a time with the slider beside the sun.' : 'Use the slider beside the sun to change the wavelength. We keep the incoming light power the same, so you can compare wavelengths fairly.'
        : partId === 'load'
          ? 'Move this slider to choose the resistor connected to your cell. Each equal step changes resistance by a ratio, rather than a fixed amount, so the slider can cover 0.0001–100 Ω. Changing it switches to Resistor load mode.'
        : partId === 'silicon'
          ? 'Thicker silicon gives light more material to travel through, so more of it can be absorbed. We count one pass through the silicon, and exaggerate the drawing’s height so you can see the change.'
        : partId === 'coating'
          ? 'Choose how much light bounces away using the reflection slider. Changing the thickness only changes the picture here; it does not calculate a new reflected percentage.'
        : partId === 'front-contacts'
          ? 'Finger width goes up to 25 cm (250,000 µm). Spacing stays where you set it. When fingers meet or overlap, metal covers the whole surface and no light can generate power. Switch to Top view to see the coverage.'
          : 'This slider changes the picture, not the electrical calculation. We exaggerate layer thicknesses so they are easier to see.'}</p>}
    </section>
  )
}
