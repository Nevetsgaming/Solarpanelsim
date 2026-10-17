import test from 'node:test'
import assert from 'node:assert/strict'
import { contactGeometry, minimumFingerSpacing, panelGeometry } from '../src/panelGeometry.ts'

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
