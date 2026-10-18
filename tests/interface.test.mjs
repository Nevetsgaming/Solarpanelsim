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
    assert.ok(render(defaultSettings, 'coating').markup.includes('Appearance only'))
    const lockedCoating = renderToStaticMarkup(createElement(PartOptions, { selectedPartId: 'coating', settings: defaultSettings, electrical: narrow.electrical, isSunlight: true, challengeActive: true, onSettingChange: () => {} }))
    assert.equal((lockedCoating.match(/disabled=""/g) ?? []).length, 2)
    const lockedWidth = renderToStaticMarkup(createElement(PartOptions, { selectedPartId: 'front-contacts', settings: defaultSettings, electrical: narrow.electrical, isSunlight: true, challengeActive: true, onSettingChange: () => {} }))
    assert.ok(lockedWidth.includes('Exact width (µm)') && lockedWidth.includes('id="finger-width-exact"'))
    assert.equal((lockedWidth.match(/disabled=""/g) ?? []).length, 1, 'width remains editable while spacing is locked')
    const { default: OpticsReadout } = await server.ssrLoadModule('/src/components/OpticsReadout.tsx')
    for (const isSunlight of [false, true]) {
      const props = { wavelengthNm: 550, thicknessUm: 180, hasSilicon: true, reflectedPercent: 5, isSunlight, unshadedFraction: 0 }
      const covered = renderToStaticMarkup(createElement(OpticsReadout, props))
      assert.ok(covered.includes('Where the light goes') && covered.includes('so power is zero'))
      assert.ok(covered.includes('<dt>Can generate charge</dt><dd>0.0</dd>'))
      const partial = renderToStaticMarkup(createElement(OpticsReadout, { ...props, unshadedFraction: 0.8 }))
      const counts = [...partial.matchAll(/<dd>([\d.]+)<\/dd>/g)].map((match) => Number(match[1]))
      assert.equal(counts.length, 5)
      assert.ok(Math.abs(counts.reduce((sum, value) => sum + value, 0) - 100) < 0.2)
    }
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
    assert.ok(mpp.includes('Maximum power (P<sub>max</sub>)') && mpp.includes(results.mpp.power.toFixed(2)))
    assert.ok(mpp.includes('Current (I<sub>mp</sub>)') && mpp.includes('Voltage (V<sub>mp</sub>)'))
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
    assert.ok(voltage.includes('How voltage is calculated') && voltage.includes('V = I × R<sub>load</sub>'))
    const { default: App } = await server.ssrLoadModule('/src/App.tsx')
    const app = renderToStaticMarkup(createElement(App))
    assert.equal((app.match(/class="power-box"/g) ?? []).length, 1)
    assert.ok(app.indexOf('class="power-box"') > app.indexOf('panel panel-visualization'))
    assert.ok(app.indexOf('class="power-box"') < app.indexOf('panel panel-learning'))
    assert.ok(app.includes('Circuit view'))
    const { default: CircuitView } = await server.ssrLoadModule('/src/components/CircuitView.tsx')
    const circuit = renderToStaticMarkup(createElement(CircuitView, { results, settings: defaultSettings, mode: 'load' }))
    assert.ok(circuit.includes('Solar cell equivalent circuit'))
    assert.ok(circuit.includes('Your external load is') && circuit.includes(`${defaultSettings.loadResistance} Ω`))
    assert.ok(circuit.includes(`${results.photocurrent.toFixed(3)} A`))
    assert.ok(circuit.includes('diodesolar.webp') && !circuit.includes('<svg'))
    assert.equal((circuit.match(/class="circuit-hotspot"/g) ?? []).length, 6)
    assert.ok(circuit.includes('The current balance') && circuit.includes('I<sub>0</sub> [e<sup>'))
    assert.ok(circuit.includes('I<sub>out</sub>') && circuit.includes('V<sub>j</sub>'))
    assert.ok(circuit.includes('class="formula-fraction"') && circuit.includes('R<sub>SH</sub>'))
    assert.ok(circuit.includes('aria-controls="circuit-explanation"'))
    const controller = renderToStaticMarkup(createElement(CircuitView, { results, settings: defaultSettings, mode: 'mpp' }))
    assert.ok(controller.includes('Maximum-power mode uses an ideal controller'))
    const incomplete = renderToStaticMarkup(createElement(CircuitView, { results: calculateElectrical(defaultSettings, true, false), settings: defaultSettings, mode: 'load' }))
    assert.ok(incomplete.includes('Assemble the cell first') && incomplete.includes('Add all four layers'))
    assert.ok(circuit.includes('I<sub>ph</sub>') && circuit.includes('they mean the same thing'))
    const { default: ExperimentPanel } = await server.ssrLoadModule('/src/components/ExperimentPanel.tsx')
    const snapshot = { settings: defaultSettings, results, isSunlight: true, mode: 'mpp' }
    const experiment = renderToStaticMarkup(createElement(ExperimentPanel, { current: snapshot, previous: snapshot, saved: snapshot, challengeBaseline: results.mpp.power, onSave: noop, onRestore: noop, onChallenge: noop, onEndChallenge: noop }))
    assert.ok(experiment.includes('Keep experimenting') && experiment.includes('Restore saved design'))
    assert.ok(experiment.includes('Sunlight, maximum-power mode and all other settings are fixed'))
    assert.ok(experiment.includes('Saved design') && experiment.includes('Power stayed the same'))
    const { default: IVCurve } = await server.ssrLoadModule('/src/components/IVCurve.tsx')
    const curve = renderToStaticMarkup(createElement(IVCurve, { results, mode: 'mpp' }))
    assert.ok(curve.includes('<polyline') && (curve.match(/<circle/g) ?? []).length === 2)
    assert.ok(!curve.includes('NaN') && !curve.includes('Infinity'))

    const narrow = renderToStaticMarkup(createElement(ContactCrossSection, { fingerWidth: 60, fingerSpacing: 1.5 }))
    const wide = renderToStaticMarkup(createElement(ContactCrossSection, { fingerWidth: 120, fingerSpacing: 1.5 }))
    assert.equal((narrow.match(/<rect /g) ?? []).length, 3)
    assert.ok(narrow.includes('stroke="#000"') && narrow.includes('height="12"'))
    assert.notEqual(narrow, wide, 'moving width changes the rendered geometry')
  } finally { await server.close() }
})
