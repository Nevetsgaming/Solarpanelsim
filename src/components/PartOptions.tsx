import { learningTopics } from '../parts'
import { partOptions } from '../partOptions'
import type { PartSettings, SettingName } from '../partOptions'
import { contactGeometry, panelGeometry } from '../panelGeometry'
import type { ElectricalResults } from '../physics/electrical'
import { formatWidth, widthFromSlider, widthToSlider } from '../experiments'
import { lightBudget } from '../physics/lightBudget'

type PartOptionsProps = {
  selectedPartId: string | null
  settings: PartSettings
  onSettingChange: (name: SettingName, value: number) => void
  isSunlight: boolean
  electrical: ElectricalResults
  challengeActive?: boolean
}

export default function PartOptions({ selectedPartId, settings, onSettingChange, isSunlight, electrical, challengeActive = false }: PartOptionsProps) {
  // The emitter and base are regions of the same silicon part.
  const partId = selectedPartId === 'emitter' || selectedPartId === 'base' ? 'silicon' : selectedPartId
  const selectedPart = learningTopics.find((part) => part.id === partId)
  const options = partId ? partOptions[partId] : undefined
  const siliconAbsorption = partId === 'silicon'
    ? lightBudget(settings.wavelengthNm, settings.siliconThickness, 0, 1, isSunlight, true).useful : 0

  if (partId === 'sun') return null

  return (
    <section className="part-options" aria-labelledby="options-title">
      <h3 id="options-title">{selectedPart ? `${selectedPart.name} options` : 'Part options'}</h3>
      {options ? options.map((option) => (
        <div className="option-control" key={option.key}>
          <label htmlFor={option.key}>{option.label}{option.appearanceOnly && <span className="appearance-label">Appearance only</span>}</label>
          <output htmlFor={option.key}>{option.key === 'fingerWidth' ? formatWidth(settings.fingerWidth) : `${settings[option.key]} ${option.unit}`}</output>
          <input
            id={option.key}
            type="range"
            disabled={challengeActive && option.key !== 'fingerWidth'}
            min={option.key === 'fingerWidth' ? 0 : option.logarithmic ? Math.log10(option.min) : option.min}
            max={option.key === 'fingerWidth' ? 1000 : option.logarithmic ? Math.log10(option.max) : option.max}
            step={option.key === 'fingerWidth' ? 1 : option.logarithmic ? 0.01 : option.step}
            value={option.key === 'fingerWidth' ? widthToSlider(settings.fingerWidth) : option.logarithmic ? Math.log10(settings[option.key]) : settings[option.key]}
            aria-valuetext={`${settings[option.key]} ${option.unit}`}
            onChange={(event) => {
              const raw = option.key === 'fingerWidth' ? widthFromSlider(Number(event.target.value)) : option.logarithmic ? 10 ** Number(event.target.value) : Number(event.target.value)
              const value = option.key === 'fingerWidth' ? Math.round(raw) : option.key === 'siliconThickness' ? Math.round(raw * 10) / 10 : Number(raw.toPrecision(6))
              onSettingChange(option.key, Math.max(option.min, Math.min(option.max, value)))
            }}
          />
          {option.key === 'siliconThickness' && <div className="contact-feedback">
            <dl><div><dt>Useful photons absorbed*</dt><dd>{(siliconAbsorption * 100).toFixed(1)}%</dd></div></dl>
            <p>*Ignoring reflection and metal shading. Only counts absorbed photons with enough energy to generate charge.</p>
            <p>Try the thin end to see power drop. Near 1065 nm, thickness matters even for thicker layers. The slider uses a logarithmic scale.</p>
          </div>}
          {option.key === 'fingerWidth' && (
            <div className="contact-feedback">
              <label htmlFor="finger-width-exact">Exact width (µm)</label>
              <input key={settings.fingerWidth} id="finger-width-exact" type="number" min={option.min} max={option.max} step="1" defaultValue={settings.fingerWidth}
                onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                onBlur={(event) => {
                  const value = event.currentTarget.valueAsNumber
                  if (Number.isFinite(value) && value >= option.min && value <= option.max) onSettingChange('fingerWidth', Math.round(value))
                  else event.currentTarget.value = String(settings.fingerWidth)
                }} />
              <dl>
                <div><dt>Light blocked by contacts</dt><dd>{((1 - electrical.unshadedFraction) * 100).toFixed(2)}%</dd></div>
                <div><dt>Finger resistance</dt><dd>{electrical.fingerResistance.toExponential(2)} Ω</dd></div>
              </dl>
              <p>Wider fingers block more sunlight, but give current an easier path. Watch the two readings as you change the width.</p>
              <p>The slider uses a logarithmic scale for fine control. You can also type an exact width above.</p>
            </div>
          )}
        </div>
      )) : <p>Select a part to see its options.</p>}
      {partId === 'front-contacts' && (
        <p>{contactGeometry(settings.fingerWidth, settings.fingerSpacing).fingerCount} fingers across 1 m. Fixed finger height: {panelGeometry.fingerHeightUm} µm. Two {panelGeometry.busbarWidthMm} mm busbars.</p>
      )}
      {partId === 'silicon' && <p>Fixed emitter depth: {panelGeometry.emitterThicknessUm} µm.</p>}
      {options && <p>{partId === 'load'
          ? 'Choose the resistor connected to your cell. The logarithmic slider covers small and large loads; moving it selects Resistor load mode.'
        : partId === 'silicon'
          ? 'Thicker silicon absorbs more light, with diminishing gains. This model does not add a penalty for thickness, so there is no thickness optimum to find. Drawing not to scale.'
        : partId === 'coating'
          ? 'Choose how much light bounces away using the reflection slider. Changing the thickness only changes the picture here; it does not calculate a new reflected percentage.'
        : partId === 'front-contacts'
          ? 'Finger width goes up to 25 cm (250,000 µm). Spacing stays where you set it. When fingers meet or overlap, metal covers the whole surface and no light can generate power. Switch to Top view to see the coverage.'
          : 'This slider changes the picture, not the electrical calculation. We exaggerate layer thicknesses so they are easier to see.'}</p>}
    </section>
  )
}
