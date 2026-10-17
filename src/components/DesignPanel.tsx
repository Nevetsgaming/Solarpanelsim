import Panel from './Panel'

type DesignPanelProps = {
  hasRearContact: boolean
  onPlaceRearContact: () => void
}

export default function DesignPanel({ hasRearContact, onPlaceRearContact }: DesignPanelProps) {
  return (
    <Panel id="design" title="Parts">
      <div className="parts-list">
        <button
          className="part"
          type="button"
          draggable={!hasRearContact}
          disabled={hasRearContact}
          onDragStart={(event) => {
            event.dataTransfer.setData('text/plain', 'rear-contact')
            event.dataTransfer.effectAllowed = 'copy'
          }}
          onClick={onPlaceRearContact}
        >
          Rear contact
        </button>
        <p className="part-hint">Drag into the middle, or click to place.</p>
      </div>
    </Panel>
  )
}
