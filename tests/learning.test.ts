import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultSettings, partOptions } from '../src/partOptions.ts'
import { calculateElectrical, device } from '../src/physics/electrical.ts'
import { lightBudget } from '../src/physics/lightBudget.ts'
import { electronCharge } from '../src/physics/optics.ts'
import { solarPhotonFlux } from '../src/physics/spectrum.ts'
import { explainChange, formatWidth, powerDifference, widthFromSlider, widthToSlider } from '../src/experiments.ts'
import type { DesignSnapshot } from '../src/experiments.ts'

function snapshot(settings = defaultSettings): DesignSnapshot {
  return { settings: { ...settings }, results: calculateElectrical(settings, true, true), mode: 'mpp', isSunlight: true }
}

test('photon budget conserves counts and distinguishes low energy from non-absorption', () => {
  for (const sunlight of [false, true]) {
    for (const wavelength of [300, 550, 1000, 1200]) {
      for (const reflection of [0, 5, 100]) {
        for (const unshaded of [0, 0.4, 1]) {
          for (const hasSilicon of [false, true]) {
            const budget = lightBudget(wavelength, 180, reflection, unshaded, sunlight, hasSilicon)
            const fractions = Object.values(budget)
            assert.ok(fractions.every((fraction) => fraction >= -1e-12 && fraction <= 1 + 1e-12))
            assert.ok(Math.abs(fractions.reduce((sum, value) => sum + value, 0) - 1) < 1e-10)
            if (!hasSilicon) assert.equal(budget.useful, 0)
          }
        }
      }
    }
  }
  assert.equal(lightBudget(1200, 180, 0, 1, false, true).belowBandgap, 1)
  assert.equal(lightBudget(1200, 180, 0, 1, false, true).unabsorbed, 0)
  const thin = lightBudget(1000, 50, 0, 1, true, true)
  const thick = lightBudget(1000, 300, 0, 1, true, true)
  assert.equal(thin.belowBandgap, thick.belowBandgap)
  assert.ok(thick.useful > thin.useful && thick.unabsorbed < thin.unabsorbed)
})

test('sunlight budget agrees with the electrical model before collection losses', () => {
  const design = snapshot()
  const budget = lightBudget(550, 180, 5, design.results.unshadedFraction, true, true)
  const expected = budget.useful * solarPhotonFlux * electronCharge * device.areaM2 * device.collectionEfficiency
  assert.ok(Math.abs(expected - design.results.photocurrent) < 1e-8)
})

test('change feedback uses computed shading, resistance and power; changed conditions are flagged', () => {
  const before = snapshot()
  const after = snapshot({ ...defaultSettings, fingerWidth: 120 })
  const feedback = explainChange(before, after)
  assert.ok(feedback.includes('block more light') && feedback.includes('resistance fell'))
  assert.ok(feedback.includes(powerDifference(before.results.mpp.power, after.results.mpp.power)))
  assert.ok(explainChange(before, { ...after, isSunlight: false }).includes('fair design comparison'))
  assert.ok(explainChange(before, { ...after, mode: 'load' }).includes('fair design comparison'))
  assert.ok(explainChange(before, { ...after, results: { ...after.results, assembled: false } }).includes('Complete the assembly'))
  assert.equal(powerDifference(10, 10), 'Power stayed the same.')
})

test('precise width controls retain the extreme range and identify appearance-only settings', () => {
  const width = partOptions['front-contacts'].find((option) => option.key === 'fingerWidth')!
  assert.equal(width.min, 20)
  assert.equal(width.max, 250000)
  assert.equal(width.logarithmic, true)
  assert.equal(formatWidth(60), '60 µm')
  assert.equal(formatWidth(1500), '1.5 mm')
  assert.equal(formatWidth(250000), '25 cm')
  assert.equal(widthFromSlider(0), 20)
  assert.equal(widthFromSlider(1000), 250000)
  for (const value of [20, 60, 1500, 250000]) assert.equal(widthFromSlider(widthToSlider(value)), value)
  const appearance = Object.values(partOptions).flat().filter((option) => option.appearanceOnly).map((option) => option.key)
  assert.deepEqual(appearance.sort(), ['coatingThickness', 'rearThickness'])
  const reference = snapshot()
  const changed = snapshot({ ...defaultSettings, rearThickness: 50, coatingThickness: 150 })
  assert.equal(reference.results.mpp.power, changed.results.mpp.power)
})

test('the fixed-condition finger challenge has an attainable improvement', () => {
  const baseline = snapshot()
  const candidates = [20, 30, 40, 80, 120, 200, 500].map((width) => snapshot({ ...defaultSettings, fingerWidth: width }).results.mpp.power)
  assert.ok(Math.max(...candidates) > baseline.results.mpp.power + 1e-6)
})

test('the thickness slider reaches thin layers with a noticeable physical power difference', () => {
  const option = partOptions.silicon.find((item) => item.key === 'siliconThickness')!
  assert.equal(option.min, 1)
  assert.equal(option.max, 1000)
  assert.equal(option.logarithmic, true)
  for (const sunlight of [false, true]) {
    const thin = calculateElectrical({ ...defaultSettings, siliconThickness: option.min }, sunlight, true)
    const thick = calculateElectrical({ ...defaultSettings, siliconThickness: option.max }, sunlight, true)
    assert.ok(thick.mpp.power > thin.mpp.power * 1.3)
    assert.ok(thick.load.power > thin.load.power)
  }
  const thin = lightBudget(1065, 1, 0, 1, false, true)
  const thick = lightBudget(1065, 1000, 0, 1, false, true)
  assert.ok(thin.useful < 0.01 && thick.useful > 0.6)
})
