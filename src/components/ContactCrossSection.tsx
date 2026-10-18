import { panelGeometry } from '../panelGeometry'

export default function ContactCrossSection() {
  const { heightMm, busbarPositionsMm, busbarWidthMm } = panelGeometry

  // Cut along a finger: its width lies out of the screen.
  // Horizontal distances are in mm; metal heights are exaggerated for visibility.
  return (
    <svg className="contact-cross-section" viewBox={`0 0 ${heightMm} 32`} preserveAspectRatio="none" aria-hidden="true">
      <g fill="#9da8b5" stroke="#000" strokeWidth="0.5">
        <rect x="0" y="20" width={heightMm} height="12" vectorEffect="non-scaling-stroke" />
        {busbarPositionsMm.map((position) => (
          <rect key={position} x={position - busbarWidthMm / 2} y="0" width={busbarWidthMm} height="20" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  )
}
