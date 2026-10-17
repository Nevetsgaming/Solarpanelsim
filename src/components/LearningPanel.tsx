import Panel from './Panel'
import { learningTopics } from '../parts'
import OpticsReadout from './OpticsReadout'
import type { PartSettings } from '../partOptions'

type LearningPanelProps = {
  selectedPartId: string | null
  settings: PartSettings
  hasSilicon: boolean
}

export default function LearningPanel({ selectedPartId, settings, hasSilicon }: LearningPanelProps) {
  const selectedPart = learningTopics.find((part) => part.id === selectedPartId)

  return (
    <Panel id="learning" title="Understand">
      {selectedPart?.description && (
        <div className="part-explanation">
          <h3>{selectedPart.name}</h3>
          <p>{selectedPart.description}</p>
        </div>
      )}
      <OpticsReadout wavelengthNm={settings.wavelengthNm} thicknessUm={settings.siliconThickness} hasSilicon={hasSilicon} />
    </Panel>
  )
}
