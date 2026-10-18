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
      assert.ok(markup.includes('Wider fingers reduce resistance but block more light'))
      assert.ok(markup.includes('class="control-help"') && markup.includes('Help with finger width'))
    }
    assert.ok(wide.electrical.unshadedFraction < narrow.electrical.unshadedFraction)
    assert.ok(wide.electrical.fingerResistance < narrow.electrical.fingerResistance)
    assert.ok(!render(defaultSettings, 'silicon').markup.includes('Light blocked by contacts'))
    assert.equal(render(defaultSettings, 'sun').markup, '', 'the sun has no duplicate options text section')
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

test('maximum-power UI renders matching current/voltage without load controls, with optional learning views', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, logLevel: 'error' })
  try {
    const { default: PowerReadout } = await server.ssrLoadModule('/src/components/PowerReadout.tsx')
    const { default: FormulaExplorer } = await server.ssrLoadModule('/src/components/FormulaExplorer.tsx')
    const { default: ContactCrossSection } = await server.ssrLoadModule('/src/components/ContactCrossSection.tsx')
    const { calculateElectrical } = await server.ssrLoadModule('/src/physics/electrical.ts')
    const { defaultSettings } = await server.ssrLoadModule('/src/partOptions.ts')
    const results = calculateElectrical(defaultSettings, true, true)
    const noop = () => {}
    const { default: LearningPanel } = await server.ssrLoadModule('/src/components/LearningPanel.tsx')
    for (const selectedPartId of ['silicon', 'emitter', 'base', 'sun', 'front-contacts', null]) {
      const inspector = renderToStaticMarkup(createElement(LearningPanel, { selectedPartId, settings: defaultSettings, electrical: results, hasSilicon: true, hasCoating: true, isSunlight: true }))
      const shouldShow = ['silicon', 'emitter', 'base'].includes(selectedPartId)
      assert.equal(inspector.includes('Watch animation'), shouldShow)
      if (shouldShow) {
        assert.ok(inspector.includes('Christiana Honsberg and Stuart Bowden'))
        assert.ok(inspector.includes('target="_blank"') && inspector.includes('rel="noopener noreferrer"'))
        assert.ok(inspector.includes('https://www.pveducation.org/pvcdrom/solar-cell-operation/light-generated-current'))
        assert.ok(!inspector.includes('<iframe'))
      }
    }
    const mpp = renderToStaticMarkup(createElement(PowerReadout, { results, onExplore: noop }))
    assert.ok(mpp.includes('Maximum power (P<sub>max</sub>)') && mpp.includes(results.mpp.power.toFixed(2)))
    assert.ok(mpp.includes('Current (I<sub>mp</sub>)') && mpp.includes('Voltage (V<sub>mp</sub>)'))
    assert.ok(!mpp.includes('Resistor load') && !mpp.includes('Electrical operating mode'))
    assert.ok(mpp.includes(results.mpp.current.toFixed(2)))
    assert.ok(mpp.includes(results.mpp.voltage.toFixed(3)))
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
    assert.ok(formula.includes('aria-expanded="false"'))
    const { default: FormulaBreakdown } = await server.ssrLoadModule('/src/components/FormulaBreakdown.tsx')
    const { expandableGroups } = await server.ssrLoadModule('/src/formulaGroups.ts')
    for (const group of expandableGroups) {
      const breakdown = renderToStaticMarkup(createElement(FormulaBreakdown, { group, mode: 'load', onClose: noop }))
      assert.ok(breakdown.includes('Inside this group') && breakdown.includes('class="formula-symbol"'))
      assert.ok(breakdown.includes('aria-describedby="symbol-explanation"'))
      assert.ok(!breakdown.includes('<button type="button" class="formula-symbol"><button'), 'symbols must not nest buttons')
    }
    const bandgap = renderToStaticMarkup(createElement(FormulaBreakdown, { group: 'cutoff', mode: 'mpp', onClose: noop }))
    assert.ok(bandgap.includes('Planck constant') && bandgap.includes('Speed of light') && bandgap.includes('Bandgap energy'))
    const diode = renderToStaticMarkup(createElement(FormulaBreakdown, { group: 'diodeLoss', mode: 'mpp', onClose: noop }))
    assert.ok(diode.includes('Elementary charge') && diode.includes('Temperature') && diode.includes('Diode ideality factor'))
    const current = renderToStaticMarkup(createElement(FormulaExplorer, { topic: 'current', results, operating: results.mpp, settings: defaultSettings, isSunlight: true, onClose: noop }))
    const voltage = renderToStaticMarkup(createElement(FormulaExplorer, { topic: 'voltage', mode: 'load', results, operating: results.load, settings: defaultSettings, isSunlight: true, onClose: noop }))
    assert.ok(current.includes('How current is calculated') && current.includes('Current tells us how much electric charge'))
    assert.ok(voltage.includes('How voltage is calculated') && voltage.includes('V = I × R<sub>load</sub>'))
    const { default: App } = await server.ssrLoadModule('/src/App.tsx')
    const app = renderToStaticMarkup(createElement(App))
    assert.equal((app.match(/class="power-box"/g) ?? []).length, 1)
    assert.ok(app.indexOf('class="power-box"') > app.indexOf('panel panel-visualization'))
    assert.ok(app.includes('data-mode="build"') && app.includes('Workspace mode'))
    assert.ok(!app.includes('panel panel-learning'), 'Build mode hides the learning column')
    assert.ok(!app.includes('Circuit view'), 'Circuit view is requested through Learn mode')
    assert.ok(app.includes('Sunlight spectrum'), 'the app starts with the terrestrial sunlight spectrum')
    assert.ok(!app.includes('Load resistance') && !app.includes('load-resistor') && !app.includes('Resistor load'))
    const { default: CircuitView } = await server.ssrLoadModule('/src/components/CircuitView.tsx')
    const circuit = renderToStaticMarkup(createElement(CircuitView, { results }))
    assert.ok(circuit.includes('Solar cell equivalent circuit'))
    assert.ok(circuit.includes('An ideal controller automatically chooses'))
    assert.ok(!circuit.includes('Resistor load') && !circuit.includes('R<sub>load</sub>'))
    assert.ok(circuit.includes(`${results.photocurrent.toFixed(3)} A`))
    assert.ok(circuit.includes('diodesolar.webp') && !circuit.includes('<svg'))
    assert.equal((circuit.match(/class="circuit-hotspot"/g) ?? []).length, 6)
    assert.ok(circuit.includes('The current balance') && circuit.includes('I<sub>0</sub> [e<sup>'))
    assert.ok(circuit.includes('I<sub>out</sub>') && circuit.includes('V<sub>j</sub>'))
    assert.ok(circuit.includes('class="formula-fraction"') && circuit.includes('R<sub>SH</sub>'))
    assert.ok(circuit.includes('aria-controls="circuit-explanation"'))
    const incomplete = renderToStaticMarkup(createElement(CircuitView, { results: calculateElectrical(defaultSettings, true, false) }))
    assert.ok(incomplete.includes('Assemble the cell first') && incomplete.includes('Add all four layers'))
    assert.ok(circuit.includes('I<sub>ph</sub>') && circuit.includes('they mean the same thing'))
    const { default: ExperimentPanel } = await server.ssrLoadModule('/src/components/ExperimentPanel.tsx')
    const snapshot = { settings: defaultSettings, results, isSunlight: true, mode: 'mpp' }
    const experiment = renderToStaticMarkup(createElement(ExperimentPanel, { current: snapshot, previous: snapshot, saved: snapshot, challengeBaseline: results.mpp.power, onSave: noop, onRestore: noop, onChallenge: noop, onEndChallenge: noop }))
    assert.ok(experiment.includes('Keep experimenting') && experiment.includes('Restore saved design'))
    assert.ok(experiment.includes('Sunlight, maximum-power mode and all other settings are fixed'))
    assert.ok(experiment.includes('Saved design') && experiment.includes('Power stayed the same'))
    const collapsedExperiment = renderToStaticMarkup(createElement(ExperimentPanel, { current: snapshot, previous: snapshot, saved: snapshot, challengeBaseline: null, onSave: noop, onRestore: noop, onChallenge: noop, onEndChallenge: noop }))
    assert.ok(collapsedExperiment.startsWith('<details class="experiment-panel">'), 'experiments start collapsed')
    assert.equal((collapsedExperiment.match(/name="experiment-tools"/g) ?? []).length, 3, 'challenge, feedback and comparison share an accordion')
    const { default: CellVisualization } = await server.ssrLoadModule('/src/components/CellVisualization.tsx')
    const canvasProps = { placedPartCount: 4, onSelectPart: noop, settings: defaultSettings, selectedPartId: null, onWavelengthChange: noop, isSunlight: true, onLightModeChange: noop, electrical: results, operatingMode: 'mpp', onOperatingModeChange: noop, onExplore: noop, challengeActive: false }
    const learnCanvas = renderToStaticMarkup(createElement(CellVisualization, { ...canvasProps, learnMode: true }))
    assert.ok(learnCanvas.includes('Circuit view') && learnCanvas.includes('class="light-flow"'))
    const { default: LightFlow } = await server.ssrLoadModule('/src/components/LightFlow.tsx')
    const coveredFlow = renderToStaticMarkup(createElement(LightFlow, { settings: defaultSettings, placedPartCount: 4, unshadedFraction: 0, isSunlight: true }))
    assert.ok(coveredFlow.includes('Blocked 100%') && coveredFlow.includes('Charge-generating 0%'))
    assert.equal((coveredFlow.match(/class="photon-ray blocked"/g) ?? []).length, 24)
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
