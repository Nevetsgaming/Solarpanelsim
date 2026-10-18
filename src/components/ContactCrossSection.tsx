import { contactSection } from '../panelGeometry'

type ContactCrossSectionProps = {
  fingerWidth: number
  fingerSpacing: number
}

export default function ContactCrossSection({ fingerWidth, fingerSpacing }: ContactCrossSectionProps) {
  const { sectionWidthMm, fingers } = contactSection(fingerWidth, fingerSpacing)

  // Cut across the fingers, between busbars. Width and pitch match the top view.
  // Metal heights and the screen-space outline are exaggerated for visibility.
  return (
    <svg className="contact-cross-section" viewBox={`0 0 ${sectionWidthMm} 14`} preserveAspectRatio="none" aria-hidden="true">
      <g fill="#b2bdc9" stroke="#000" strokeWidth="1">
        {fingers.map((finger) => (
          <rect key={finger.centre} x={finger.left} y="1" width={finger.width} height="12" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  )
}
