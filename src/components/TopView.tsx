import { useId } from 'react'
import type { PartSettings } from '../partOptions'
import { contactGeometry, panelGeometry } from '../panelGeometry'

type TopViewProps = {
  placedPartCount: number
  settings: PartSettings
  selectedPartId: string | null
  onSelectPart: (partId: string) => void
}

export default function TopView({ placedPartCount, settings, selectedPartId, onSelectPart }: TopViewProps) {
  const patternId = useId()
  if (placedPartCount === 0) return null

  // All SVG coordinates below are millimetres, including the magnified detail.
  const { widthMm, heightMm, detailWidthMm, busbarWidthMm, busbarPositionsMm } = panelGeometry
  const { fingerWidthMm, fingerSpacingMm, fingerCount } = contactGeometry(settings.fingerWidth, settings.fingerSpacing)
  const hasFrontContacts = placedPartCount >= 4
  const topPartId = hasFrontContacts ? 'front-contacts' : placedPartCount === 3 ? 'coating' : placedPartCount === 2 ? 'silicon' : 'rear-contact'
  const surfaceColour = placedPartCount >= 3 ? '#b4d5df' : placedPartCount >= 2 ? '#324f70' : '#687788'

  return (
    <div className="top-view">
      <button type="button" className="top-cell" data-part-id={topPartId} aria-label={`Top view: select ${topPartId.replaceAll('-', ' ')}`} aria-pressed={selectedPartId === topPartId} onClick={() => onSelectPart(topPartId)}>
        <svg viewBox={`0 0 ${widthMm} ${heightMm}`} role="img" aria-label="One metre by one metre panel overview">
          <defs>
            <pattern id={patternId} patternUnits="userSpaceOnUse" width={fingerSpacingMm} height={heightMm}>
              <rect x={(fingerSpacingMm - fingerWidthMm) / 2} width={fingerWidthMm} height={heightMm} fill="#9da8b5" />
            </pattern>
          </defs>
          <rect width={widthMm} height={heightMm} fill={surfaceColour} />
          {hasFrontContacts && (
            <g>
              <rect width={widthMm} height={heightMm} fill={`url(#${patternId})`} />
              {busbarPositionsMm.map((position) => <rect key={position} x="0" y={position - busbarWidthMm / 2} width={widthMm} height={busbarWidthMm} fill="#9da8b5" />)}
            </g>
          )}
        </svg>
      </button>
      <p className="top-view-caption">1 m × 1 m · 1 m² active area</p>
      {hasFrontContacts && (
        <>
          <p className="top-view-caption">{fingerCount} fingers · {settings.fingerWidth} µm wide · {settings.fingerSpacing} mm pitch</p>
          <p className="top-view-caption">Contact detail · {detailWidthMm} mm × {detailWidthMm} mm</p>
          <svg className="contact-detail" viewBox={`0 0 ${detailWidthMm} ${detailWidthMm}`} role="img" aria-label="Magnified contact detail showing actual finger width and spacing proportions">
            <rect width={detailWidthMm} height={detailWidthMm} fill={surfaceColour} />
            <rect width={detailWidthMm} height={detailWidthMm} fill={`url(#${patternId})`} />
          </svg>
          <p className="top-view-caption">Two fixed 5 mm busbars. Simplified grid; no separate cells or wiring.</p>
        </>
      )}
    </div>
  )
}
