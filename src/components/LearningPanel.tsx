import Panel from './Panel'
import { learningTopics } from '../parts'
import OpticsReadout from './OpticsReadout'
import type { PartSettings } from '../partOptions'
import { calculateOptics } from '../physics/optics'
import { solarPhotonFlux } from '../physics/spectrum'
import type { ElectricalResults } from '../physics/electrical'

type LearningPanelProps = {
  selectedPartId: string | null
  settings: PartSettings
  hasSilicon: boolean
  hasCoating: boolean
  isSunlight: boolean
  electrical: ElectricalResults
}

export default function LearningPanel({ selectedPartId, settings, hasSilicon, hasCoating, isSunlight, electrical }: LearningPanelProps) {
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
          {sunReadings && (settings.wavelengthNm < 380 || settings.wavelengthNm > 780) && <p>Our eyes cannot see ultraviolet or infrared light. We give them a colour on screen just so you can tell when you are using them.</p>}
          {selectedPartId === 'sun' && isSunlight && <dl className="sun-readings"><div><dt>Photon energy</dt><dd>Multiple wavelengths</dd></div><div><dt>Incoming photon rate</dt><dd>{solarPhotonFlux.toExponential(2)} /s/m²</dd></div></dl>}
        </div>
      )}
      {!selectedPart && <div className="inspector-empty"><h3>Explore a part</h3><p>Click a layer, the sun, or the resistor. We’ll look at what it does and how it helps the cell work.</p></div>}
      <OpticsReadout wavelengthNm={settings.wavelengthNm} thicknessUm={settings.siliconThickness} hasSilicon={hasSilicon} reflectedPercent={hasCoating ? settings.reflectedPercent : 0} isSunlight={isSunlight} unshadedFraction={electrical.assembled ? electrical.unshadedFraction : 1} />
    </Panel>
  )
}
