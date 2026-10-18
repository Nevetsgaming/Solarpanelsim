// Fixed active footprint for this teaching model, not a complete multi-cell module.
export const panelGeometry = {
  widthMm: 1000,
  heightMm: 1000,
  detailWidthMm: 20,
  busbarWidthMm: 5,
  busbarPositionsMm: [250, 750],
  fingerHeightUm: 20,
  emitterThicknessUm: 0.5,
}

export function contactGeometry(fingerWidthUm: number, fingerSpacingMm: number) {
  const fingerWidthMm = fingerWidthUm / 1000
  // Centre the first finger half a pitch from the edge; count centres inside the panel.
  const fingerCount = Math.max(0, Math.ceil(panelGeometry.widthMm / fingerSpacingMm - 0.5))
  return { fingerWidthMm, fingerSpacingMm, fingerCount }
}

export function contactSection(fingerWidthUm: number, fingerSpacingMm: number) {
  const { fingerWidthMm } = contactGeometry(fingerWidthUm, fingerSpacingMm)
  // Show three representative fingers so narrow contacts remain legible.
  const sectionWidthMm = Math.min(panelGeometry.widthMm, fingerSpacingMm * 3)
  const fingers = Array.from({ length: Math.ceil(sectionWidthMm / fingerSpacingMm) }, (_, index) => {
    const centre = (index + 0.5) * fingerSpacingMm
    return { centre, left: centre - fingerWidthMm / 2, width: fingerWidthMm }
  }).filter((finger) => finger.centre < sectionWidthMm)
  return { sectionWidthMm, fingers }
}
