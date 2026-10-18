import Panel from './Panel'
import { learningTopics } from '../parts'
import OpticsReadout from './OpticsReadout'
import type { PartSettings } from '../partOptions'
import { calculateOptics } from '../physics/optics'
import { solarPhotonFlux } from '../physics/spectrum'
import type { ElectricalResults } from '../physics/electrical'
import type { OperatingMode } from '../physics/electrical'
import PowerReadout from './PowerReadout'
import type { ReadingTopic } from './PowerReadout'

type LearningPanelProps = {
  selectedPartId: string | null
  settings: PartSettings
  hasSilicon: boolean
  hasCoating: boolean
  isSunlight: boolean
  electrical: ElectricalResults
  operatingMode: OperatingMode
  onOperatingModeChange: (mode: OperatingMode) => void
  onExplore: (topic: ReadingTopic) => void
}

export default function LearningPanel({ selectedPartId, settings, hasSilicon, hasCoating, isSunlight, electrical, operatingMode, onOperatingModeChange, onExplore }: LearningPanelProps) {
  const selectedPart = learningTopics.find((part) => part.id === selectedPartId)
  const sunReadings = selectedPartId === 'sun' && !isSunlight
    ? calculateOptics(settings.wavelengthNm, settings.siliconThickness) : null

  return (
    <Panel id="learning" title="Inspector">
      <PowerReadout results={electrical} mode={operatingMode} onModeChange={onOperatingModeChange} onExplore={onExplore} />
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
