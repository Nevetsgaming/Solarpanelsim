import Panel from './Panel'
import { learningTopics } from '../parts'
import OpticsReadout from './OpticsReadout'
import type { PartSettings } from '../partOptions'
import { calculateOptics } from '../physics/optics'

type LearningPanelProps = {
  selectedPartId: string | null
  settings: PartSettings
  hasSilicon: boolean
  hasCoating: boolean
  isSunlight: boolean
}

export default function LearningPanel({ selectedPartId, settings, hasSilicon, hasCoating, isSunlight }: LearningPanelProps) {
  const selectedPart = learningTopics.find((part) => part.id === selectedPartId)
  const sunReadings = selectedPartId === 'sun' && !isSunlight
    ? calculateOptics(settings.wavelengthNm, settings.siliconThickness) : null

  return (
    <Panel id="learning" title="Inspector">
      {selectedPart?.description && (
        <div className="part-explanation">
          <h3>{selectedPart.name}</h3>
          <p>{selectedPart.description}</p>
          {sunReadings && (
            <dl className="sun-readings">
              <div><dt>Photon energy</dt><dd>{sunReadings.energyEv.toFixed(3)} eV</dd></div>
              <div><dt>Incoming photon rate</dt><dd>{sunReadings.photonFlux.toExponential(2)} /s/m²</dd></div>
            </dl>
          )}
          {sunReadings && (settings.wavelengthNm < 380 || settings.wavelengthNm > 780) && <p>UV and infrared are invisible; their on-screen colours are symbolic.</p>}
        </div>
      )}
      {!selectedPart && <div className="inspector-empty"><h3>Explore a part</h3><p>Select a layer, the sun, or the load to see what it does.</p></div>}
      {isSunlight ? (
        <section className="optics-readout" aria-label="Sunlight mode">
          <h3>Sunlight spectrum</h3>
          <p>Sunlight contains a mixture of wavelengths, including ultraviolet, visible and infrared light.</p>
          <p>Single-wavelength readings are hidden in this mode. Solar-spectrum calculations have not been added yet.</p>
        </section>
      ) : (
        <OpticsReadout wavelengthNm={settings.wavelengthNm} thicknessUm={settings.siliconThickness} hasSilicon={hasSilicon} reflectedPercent={hasCoating ? settings.reflectedPercent : 0} />
      )}
    </Panel>
  )
}
