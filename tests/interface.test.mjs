import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

test('power modes render matching voltage/current, and the formula explorer starts with the diode equation', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, logLevel: 'error' })
  try {
    const { default: PowerReadout } = await server.ssrLoadModule('/src/components/PowerReadout.tsx')
    const { default: FormulaExplorer } = await server.ssrLoadModule('/src/components/FormulaExplorer.tsx')
    const { default: ContactCrossSection } = await server.ssrLoadModule('/src/components/ContactCrossSection.tsx')
    const { calculateElectrical } = await server.ssrLoadModule('/src/physics/electrical.ts')
    const { defaultSettings } = await server.ssrLoadModule('/src/partOptions.ts')
    const results = calculateElectrical(defaultSettings, true, true)
    const noop = () => {}
    const mpp = renderToStaticMarkup(createElement(PowerReadout, { results, mode: 'mpp', onModeChange: noop, onExplore: noop }))
    const load = renderToStaticMarkup(createElement(PowerReadout, { results, mode: 'load', onModeChange: noop, onExplore: noop }))
    assert.ok(mpp.includes('Maximum power (Pmax)') && mpp.includes(results.mpp.power.toFixed(2)))
    assert.ok(mpp.includes('Current (Imp)') && mpp.includes('Voltage (Vmp)'))
    assert.ok(load.includes('Load current') && load.includes('Load voltage'))
    assert.ok(mpp.includes('aria-haspopup="dialog"'))

    const formula = renderToStaticMarkup(createElement(FormulaExplorer, { results, operating: results.mpp, settings: defaultSettings, isSunlight: true, onClose: noop }))
    assert.ok(formula.includes('<dialog') && formula.includes('Illuminated single-diode equation'))
    assert.ok(formula.includes('Photocurrent · A: open photocurrent integral'))
    assert.ok(formula.includes('Diode saturation current') && formula.includes('Shunt resistance'))

    const narrow = renderToStaticMarkup(createElement(ContactCrossSection, { fingerWidth: 60, fingerSpacing: 1.5 }))
    const wide = renderToStaticMarkup(createElement(ContactCrossSection, { fingerWidth: 120, fingerSpacing: 1.5 }))
    assert.equal((narrow.match(/<rect /g) ?? []).length, 3)
    assert.ok(narrow.includes('stroke="#000"') && narrow.includes('height="12"'))
    assert.notEqual(narrow, wide, 'moving width changes the rendered geometry')
  } finally { await server.close() }
})
