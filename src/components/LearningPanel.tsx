import Panel from './Panel'
import { learningTopics } from '../parts'
import OpticsReadout from './OpticsReadout'
import WavelengthGuide from './WavelengthGuide'
import type { PartSettings } from '../partOptions'
import { calculateOptics } from '../physics/optics'
import type { ElectricalResults } from '../physics/electrical'
import type { ReactNode } from 'react'

type LearningPanelProps = {
  selectedPartId: string | null
  settings: PartSettings
  hasSilicon: boolean
  hasCoating: boolean
  isSunlight: boolean
  electrical: ElectricalResults
  experiment?: ReactNode
}

export default function LearningPanel({ selectedPartId, settings, hasSilicon, hasCoating, isSunlight, electrical, experiment }: LearningPanelProps) {
  const selectedPart = learningTopics.find((part) => part.id === selectedPartId)
  const sunReadings = selectedPartId === 'sun' && !isSunlight
    ? calculateOptics(settings.wavelengthNm, settings.siliconThickness) : null

  return (
    <Panel id="learning" title="Learn">
      {selectedPart?.description && (
        <div className="part-explanation">
          <h3>{selectedPart.name}</h3>
          <p>{selectedPart.description}</p>
          {selectedPart.detail && <details className="part-detail"><summary>Why it works</summary><p>{selectedPart.detail}</p></details>}
          {['silicon', 'emitter', 'base'].includes(selectedPart.id) && (
            <div className="animation-link">
              <a className="watch-animation" href="https://www.pveducation.org/pvcdrom/solar-cell-operation/light-generated-current" target="_blank" rel="noopener noreferrer">Watch animation <span className="small-note">(opens in a new tab)</span></a>
              <p className="animation-credit">Animation by Christiana Honsberg and Stuart Bowden, <a href="https://www.pveducation.org/pvcdrom/solar-cell-operation/light-generated-current" target="_blank" rel="noopener noreferrer">PVEducation</a>. Shows charge flow at short circuit.</p>
            </div>
          )}
          {sunReadings && (
            <dl className="sun-readings">
              <div><dt>Photon energy</dt><dd>{sunReadings.energyEv.toFixed(3)} eV</dd></div>
            </dl>
          )}
          {selectedPartId === 'sun' && isSunlight && <dl className="sun-readings"><div><dt>Photon energy</dt><dd>Multiple wavelengths</dd></div></dl>}
          {selectedPartId === 'sun' && <WavelengthGuide wavelengthNm={settings.wavelengthNm} isSunlight={isSunlight} />}
        </div>
      )}
      {!selectedPart && <div className="inspector-empty"><h3>Explore a part</h3><p>Click a layer or the sun. We’ll look at what it does and how it helps the cell work.</p></div>}
      <details className="learn-section"><summary>Where the light goes</summary>
        <OpticsReadout wavelengthNm={settings.wavelengthNm} thicknessUm={settings.siliconThickness} hasSilicon={hasSilicon} reflectedPercent={hasCoating ? settings.reflectedPercent : 0} isSunlight={isSunlight} unshadedFraction={electrical.assembled ? electrical.unshadedFraction : 1} />
      </details>
      {experiment}
    </Panel>
  )
}
