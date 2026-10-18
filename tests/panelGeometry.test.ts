import test from 'node:test'
import assert from 'node:assert/strict'
import { contactGeometry, contactSection, minimumFingerSpacing, panelGeometry } from '../src/panelGeometry.ts'

test('panel footprint is one square metre and default grid uses micrometre-wide fingers', () => {
  assert.equal(panelGeometry.widthMm * panelGeometry.heightMm / 1e6, 1)
  const grid = contactGeometry(60, 1.5)
  assert.equal(grid.fingerWidthMm, 0.06)
  assert.equal(grid.fingerCount, 667)
})

test('spacing endpoints give expected counts across a metre', () => {
  assert.equal(contactGeometry(60, 0.5).fingerCount, 2000)
  assert.equal(contactGeometry(60, 3).fingerCount, 333)
})

test('10 cm fingers fit with automatically increased spacing', () => {
  const spacing = minimumFingerSpacing(100000)
  const grid = contactGeometry(100000, spacing)
  assert.equal(grid.fingerWidthMm, 100)
  assert.equal(spacing, 100.1)
  assert.equal(grid.fingerCount, 10)
  assert.ok(grid.fingerWidthMm < grid.fingerSpacingMm)
  assert.equal(minimumFingerSpacing(60), 0.5)
})

test('cross-section uses actual finger widths and centre-to-centre spacing', () => {
  const narrow = contactSection(60, 1.5)
  const wide = contactSection(120, 1.5)
  assert.equal(narrow.sectionWidthMm, 4.5)
  assert.equal(wide.fingers[0].width, narrow.fingers[0].width * 2)
  assert.ok(Math.abs(narrow.fingers[1].centre - narrow.fingers[0].centre - 1.5) < 1e-10)
  assert.equal(contactSection(60, 3).fingers.length, 3)
  assert.equal(narrow.fingers.length, 3)
})

test('cross-section expands its crop to show centimetre-wide fingers', () => {
  const section = contactSection(100000, 100.1)
  assert.ok(section.sectionWidthMm > 300 && section.sectionWidthMm < 301)
  assert.equal(section.fingers.length, 3)
  assert.equal(section.fingers[0].width, 100)
})

test('finger widths remain smaller than pitch, and all counted centres fit the panel', () => {
  for (const width of [20, 60, 120]) {
    for (const spacing of [0.5, 1, 1.5, 2, 3]) {
      const grid = contactGeometry(width, spacing)
      assert.ok(grid.fingerWidthMm < spacing)
      const lastCentre = spacing / 2 + (grid.fingerCount - 1) * spacing
      assert.ok(lastCentre < panelGeometry.widthMm)
      assert.ok(lastCentre + spacing >= panelGeometry.widthMm)
    }
  }
})
