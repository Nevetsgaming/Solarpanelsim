import Panel from './Panel'
import { parts } from '../parts'

type LearningPanelProps = {
  selectedPartId: string | null
}

export default function LearningPanel({ selectedPartId }: LearningPanelProps) {
  const selectedPart = parts.find((part) => part.id === selectedPartId)

  return (
    <Panel id="learning" title="Understand">
      {selectedPart?.description && (
        <div className="part-explanation">
          <h3>{selectedPart.name}</h3>
          <p>{selectedPart.description}</p>
        </div>
      )}
    </Panel>
  )
}
