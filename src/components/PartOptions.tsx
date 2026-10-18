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

  const helpText: Partial<Record<SettingName, string>> = {
    fingerWidth: 'Wider fingers reduce resistance but block more light. Use this logarithmic slider or type an exact width below; maximum 25 cm.',
    fingerSpacing: 'Distance between finger centres. Closer fingers shade more silicon but shorten the path current travels through silicon. Spacing stays independent of width.',
    siliconThickness: 'Thicker silicon absorbs more usable photons. Try the thin end or 1065 nm to see a stronger effect. The scale is logarithmic; this model adds no thickness penalty.',
    reflectedPercent: 'The fraction of light bouncing away. Lower reflection lets more light enter. It is the same for all wavelengths in this model.',
    coatingThickness: 'Appearance only: thickness changes the drawing, not reflection or power.',
    rearThickness: 'Appearance only: thickness changes the drawing, not resistance or power.',
  }

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
            <dl><div><dt>Useful photons absorbed</dt><dd>{(siliconAbsorption * 100).toFixed(1)}%</dd></div></dl>

          </div>}
          {option.key === 'fingerWidth' && (
            <div className="contact-feedback">
              <dl>
                <div><dt>Light blocked by contacts</dt><dd>{((1 - electrical.unshadedFraction) * 100).toFixed(2)}%</dd></div>
              </dl>

            </div>
          )}
          <details className="control-help">
            <summary aria-label={`Help with ${option.label.toLowerCase()}`}>?</summary>
            <p>{helpText[option.key]}</p>
            {option.key === 'fingerWidth' && <>
              <label htmlFor="finger-width-exact">Exact width (µm)</label>
              <input key={settings.fingerWidth} id="finger-width-exact" type="number" min={option.min} max={option.max} step="1" defaultValue={settings.fingerWidth}
                onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                onBlur={(event) => {
                  const value = event.currentTarget.valueAsNumber
                  if (Number.isFinite(value) && value >= option.min && value <= option.max) onSettingChange('fingerWidth', Math.round(value))
                  else event.currentTarget.value = String(settings.fingerWidth)
                }} />
              <p>Finger resistance: {electrical.fingerResistance.toExponential(2)} Ω. {contactGeometry(settings.fingerWidth, settings.fingerSpacing).fingerCount} fingers across 1 m.</p>
            </>}
            {option.key === 'siliconThickness' && <p>Absorption reading ignores reflection and shading. Emitter depth: {panelGeometry.emitterThicknessUm} µm. Drawing not to scale.</p>}
          </details>
        </div>
      )) : <p>Select a part to adjust it.</p>}

    </section>
  )
}
