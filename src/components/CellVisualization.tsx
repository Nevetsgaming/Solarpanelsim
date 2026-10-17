import Panel from './Panel'

type CellVisualizationProps = {
  hasRearContact: boolean
  onPlaceRearContact: () => void
}

export default function CellVisualization({ hasRearContact, onPlaceRearContact }: CellVisualizationProps) {
  return (
    <Panel id="visualization" title="Assembly">
      <div
        className="assembly-area"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          if (event.dataTransfer.getData('text/plain') === 'rear-contact') {
            onPlaceRearContact()
          }
        }}
      >
        <div className="assembly-status" role="status">
          {hasRearContact ? <div className="rear-contact">Rear contact</div> : 'Drop the rear contact here'}
        </div>
      </div>
    </Panel>
  )
}
