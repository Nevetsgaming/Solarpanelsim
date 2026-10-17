import Panel from './Panel'
import { learningTopics } from '../parts'
import OpticsReadout from './OpticsReadout'
import type { PartSettings } from '../partOptions'

type LearningPanelProps = {
  selectedPartId: string | null
  settings: PartSettings
  hasSilicon: boolean
  hasCoating: boolean
  isSunlight: boolean
}

export default function LearningPanel({ selectedPartId, settings, hasSilicon, hasCoating, isSunlight }: LearningPanelProps) {
  const selectedPart = learningTopics.find((part) => part.id === selectedPartId)

  return (
    <Panel id="learning" title="Understand">
      {selectedPart?.description && (
        <div className="part-explanation">
          <h3>{selectedPart.name}</h3>
          <p>{selectedPart.description}</p>
        </div>
      )}
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
