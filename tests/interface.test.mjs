import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

test('finger-width feedback shows current contact shading and resistance only for front contacts', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, logLevel: 'error' })
  try {
    const { default: PartOptions } = await server.ssrLoadModule('/src/components/PartOptions.tsx')
    const { calculateElectrical } = await server.ssrLoadModule('/src/physics/electrical.ts')
    const { defaultSettings } = await server.ssrLoadModule('/src/partOptions.ts')
    function render(settings, selectedPartId = 'front-contacts') {
      const electrical = calculateElectrical(settings, true, true)
      const markup = renderToStaticMarkup(createElement(PartOptions, { selectedPartId, settings, electrical, isSunlight: true, onSettingChange: () => {} }))
      return { electrical, markup }
    }
    const narrow = render(defaultSettings)
    const wide = render({ ...defaultSettings, fingerWidth: defaultSettings.fingerWidth * 2 })
    for (const { electrical, markup } of [narrow, wide]) {
      assert.ok(markup.includes('Light blocked by contacts'))
      assert.ok(markup.includes(`${((1 - electrical.unshadedFraction) * 100).toFixed(2)}%`))
      assert.ok(markup.includes(`${electrical.fingerResistance.toExponential(2)} Ω`))
      assert.ok(markup.includes('Wider fingers block more sunlight'))
    }
    assert.ok(wide.electrical.unshadedFraction < narrow.electrical.unshadedFraction)
    assert.ok(wide.electrical.fingerResistance < narrow.electrical.fingerResistance)
    assert.ok(!render(defaultSettings, 'silicon').markup.includes('Light blocked by contacts'))
  } finally { await server.close() }
})

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
    assert.equal((mpp.match(/aria-haspopup="dialog"/g) ?? []).length, 3)
    assert.ok(mpp.includes('Explore current calculation') && mpp.includes('Explore voltage calculation'))

    const formula = renderToStaticMarkup(createElement(FormulaExplorer, { results, operating: results.mpp, settings: defaultSettings, isSunlight: true, onClose: noop }))
    assert.ok(formula.includes('<dialog') && formula.includes('Illuminated single-diode equation'))
    assert.ok(formula.includes('Photocurrent · A: open photocurrent integral'))
    assert.ok(formula.includes('aria-label="Current lost through the diode"'))
    assert.ok(formula.includes('aria-label="Current lost through a leakage path"'))
    assert.ok(formula.includes('aria-label="Power = voltage × current"'))
    assert.ok(!formula.includes('aria-label="Elementary charge'))
    assert.ok(!formula.includes('aria-label="Temperature'))
    const current = renderToStaticMarkup(createElement(FormulaExplorer, { topic: 'current', results, operating: results.mpp, settings: defaultSettings, isSunlight: true, onClose: noop }))
    const voltage = renderToStaticMarkup(createElement(FormulaExplorer, { topic: 'voltage', mode: 'load', results, operating: results.load, settings: defaultSettings, isSunlight: true, onClose: noop }))
    assert.ok(current.includes('How current is calculated') && current.includes('Current tells us how much electric charge'))
    assert.ok(voltage.includes('How voltage is calculated') && voltage.includes('V = I × Rload'))
    const { default: App } = await server.ssrLoadModule('/src/App.tsx')
    const app = renderToStaticMarkup(createElement(App))
    assert.equal((app.match(/class="power-box"/g) ?? []).length, 1)
    assert.ok(app.indexOf('class="power-box"') > app.indexOf('panel panel-learning'))
    assert.ok(app.indexOf('class="power-box"') < app.indexOf('class="inspector-empty"'))

    const narrow = renderToStaticMarkup(createElement(ContactCrossSection, { fingerWidth: 60, fingerSpacing: 1.5 }))
    const wide = renderToStaticMarkup(createElement(ContactCrossSection, { fingerWidth: 120, fingerSpacing: 1.5 }))
    assert.equal((narrow.match(/<rect /g) ?? []).length, 3)
    assert.ok(narrow.includes('stroke="#000"') && narrow.includes('height="12"'))
    assert.notEqual(narrow, wide, 'moving width changes the rendered geometry')
  } finally { await server.close() }
})
