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
          {sunReadings && (settings.wavelengthNm < 380 || settings.wavelengthNm > 780) && <p>UV and infrared are invisible; their on-screen colours are symbolic.</p>}
          {selectedPartId === 'sun' && isSunlight && <dl className="sun-readings"><div><dt>Photon energy</dt><dd>Multiple wavelengths</dd></div><div><dt>Incoming photon rate</dt><dd>{solarPhotonFlux.toExponential(2)} /s/m²</dd></div></dl>}
        </div>
      )}
      {!selectedPart && <div className="inspector-empty"><h3>Explore a part</h3><p>Select a layer, the sun, or the load to see what it does.</p></div>}
      {isSunlight ? (
        <section className="optics-readout" aria-label="Sunlight mode">
          <h3>Light & absorption</h3>
          <dl>
            <div><dt>Spectrum</dt><dd>AM1.5G</dd></div>
            <div><dt>Optical input</dt><dd>1000 W/m²</dd></div>
            <div><dt>Reflected</dt><dd>{hasCoating ? settings.reflectedPercent : 0}%</dd></div>
            {electrical.assembled && <div><dt>Photocurrent</dt><dd>{electrical.photocurrent.toFixed(2)} A</dd></div>}
          </dl>
          <p><a href="https://www.nlr.gov/grid/solar-resource/spectra-am1.5" target="_blank" rel="noreferrer">ASTM G173 source spectrum</a></p>
        </section>
      ) : (
        <OpticsReadout wavelengthNm={settings.wavelengthNm} thicknessUm={settings.siliconThickness} hasSilicon={hasSilicon} reflectedPercent={hasCoating ? settings.reflectedPercent : 0} />
      )}
    </Panel>
  )
}
