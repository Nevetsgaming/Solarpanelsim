import type { PartSettings } from '../partOptions'

type TopViewProps = {
  placedPartCount: number
  settings: PartSettings
  selectedPartId: string | null
  onSelectPart: (partId: string) => void
}

export default function TopView({ placedPartCount, settings, selectedPartId, onSelectPart }: TopViewProps) {
  // Same 60 px/mm scale as the cross-section. Busbar geometry stays fixed.
  const size = 260
  const fingerWidth = settings.fingerWidth / 1000 * 60
  const fingerSpacing = settings.fingerSpacing * 60
  const fingerPositions = Array.from({ length: Math.ceil(size / fingerSpacing) }, (_, index) => fingerSpacing / 2 + index * fingerSpacing)
    .filter((position) => position < size)
  const hasFrontContacts = placedPartCount >= 4
  const topPartId = hasFrontContacts ? 'front-contacts' : placedPartCount === 3 ? 'coating' : placedPartCount === 2 ? 'silicon' : 'rear-contact'
  const surfaceColour = placedPartCount >= 3 ? '#b4d5df' : placedPartCount >= 2 ? '#324f70' : '#687788'

  if (placedPartCount === 0) {
    return (
      <div className="top-view">
        <div className="top-cell top-cell-placeholder" role="img" aria-label="Empty solar cell top view">
          <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
            <rect x="1" y="1" width={size - 2} height={size - 2} />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="top-view">
      <button type="button" className="top-cell" aria-label={`Top view: select ${topPartId.replaceAll('-', ' ')}`} aria-pressed={selectedPartId === topPartId} onClick={() => onSelectPart(topPartId)}>
        <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={hasFrontContacts ? 'Silicon surface with thin vertical metal fingers connected by two horizontal busbars' : 'Top surface of the assembled layers'}>
          <rect width={size} height={size} fill={surfaceColour} />
          {hasFrontContacts && (
            <g fill="#9da8b5" stroke="#000" strokeWidth="0.5">
              {fingerPositions.map((position) => <rect key={position} x={position - fingerWidth / 2} y="0" width={fingerWidth} height={size} />)}
              <rect x="0" y="61" width={size} height="8" />
              <rect x="0" y="191" width={size} height="8" />
            </g>
          )}
        </svg>
      </button>
      {hasFrontContacts && <p className="top-view-caption">Vertical fingers · horizontal busbars</p>}
    </div>
  )
}
