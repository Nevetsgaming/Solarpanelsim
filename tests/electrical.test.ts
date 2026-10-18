import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultSettings } from '../src/partOptions.ts'
import { calculateOptics, electronCharge, photonEnergyJoules } from '../src/physics/optics.ts'
import { absorbedSolarPhotonFlux, referenceSpectrumPower, solarPhotonFlux } from '../src/physics/spectrum.ts'
import { calculateElectrical, contactLosses, device, diodeCurrent, photocurrent, referencePhotocurrent, solveElectrical } from '../src/physics/electrical.ts'

function close(actual: number, expected: number, tolerance = 1e-7) {
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} differs from ${expected}`)
}

test('source spectrum retains its full optical power, including unusable infrared', () => {
  assert.ok(referenceSpectrumPower > 1000 && referenceSpectrumPower < 1001)
  assert.ok(solarPhotonFlux > 3e21 && solarPhotonFlux < 6e21)
  assert.equal(absorbedSolarPhotonFlux(0), 0)
  assert.ok(absorbedSolarPhotonFlux(180) < solarPhotonFlux)
  const values = [50, 100, 150, 200].map(absorbedSolarPhotonFlux)
  assert.ok(values[1] > values[0])
  assert.ok(values[2] - values[1] < values[1] - values[0])
})

test('monochromatic integral agrees with q times incident photon rate and optical losses', () => {
  const settings = { ...defaultSettings, wavelengthNm: 1000 }
  const optics = calculateOptics(1000, settings.siliconThickness)
  const expected = electronCharge * device.areaM2 * (1000 / photonEnergyJoules(1000)) * optics.absorbedFraction * (1 - settings.reflectedPercent / 100)
  close(photocurrent(settings, false).integralCurrent, expected)
  const zeroReflection = photocurrent({ ...settings, reflectedPercent: 0 }, false)
  const halfReflection = photocurrent({ ...settings, reflectedPercent: 50 }, false)
  close(halfReflection.photocurrent, zeroReflection.photocurrent / 2)
})

test('metal shading counts intersections once and resistance includes both paths', () => {
  const base = contactLosses(defaultSettings)
  const wider = contactLosses({ ...defaultSettings, fingerWidth: 120 })
  const spaced = contactLosses({ ...defaultSettings, fingerSpacing: 3 })
  assert.ok(base.unshadedFraction > 0.94 && base.unshadedFraction < 0.96)
  assert.ok(wider.unshadedFraction < base.unshadedFraction)
  close(wider.fingerResistance, base.fingerResistance / 2)
  close(spaced.surfaceResistance, base.surfaceResistance * 4)
  close(spaced.fingerResistance, base.fingerResistance * 2)
})

test('diode calibration reaches the stated reference Voc', () => {
  close(solveElectrical(referencePhotocurrent, 0, 1).openCircuitVoltage, device.referenceVoc)
})

test('MPP and load readings satisfy Shockley/Kirchhoff, P=VI and Ohm’s law', () => {
  for (const isSunlight of [false, true]) {
    for (const loadResistance of [0.0001, 0.002, 1, 100]) {
      const result = calculateElectrical({ ...defaultSettings, loadResistance }, isSunlight, true)
      for (const point of [result.mpp, result.load]) {
        close(point.power, point.voltage * point.current)
        close(point.current, diodeCurrent(point.voltage + point.current * result.seriesResistance, result.photocurrent))
        assert.ok(point.power >= 0 && point.power <= 1000)
      }
      close(result.load.voltage, result.load.current * loadResistance)
      assert.ok(result.mpp.power >= result.load.power - 1e-7)
    }
  }
})

test('maximum-power search beats every point in a dense independent junction-voltage sweep', () => {
  const result = calculateElectrical(defaultSettings, true, true)
  for (let step = 0; step <= 2000; step++) {
    const junctionVoltage = result.openCircuitVoltage * step / 2000
    const current = Math.max(0, diodeCurrent(junctionVoltage, result.photocurrent))
    const voltage = Math.max(0, junctionVoltage - current * result.seriesResistance)
    assert.ok(result.mpp.power >= current * voltage - 1e-7)
  }
})

test('dark, fully reflected and incomplete designs cannot deliver power', () => {
  for (const settings of [{ ...defaultSettings, wavelengthNm: 1200 }, { ...defaultSettings, reflectedPercent: 100 }]) {
    assert.equal(calculateElectrical(settings, false, true).mpp.power, 0)
  }
  assert.equal(calculateElectrical({ ...defaultSettings, reflectedPercent: 100 }, true, true).mpp.power, 0)
  assert.equal(calculateElectrical(defaultSettings, true, false).load.power, 0)
})

test('extended contact ranges remain finite and energy-bounded', () => {
  for (const fingerWidth of [20, 100000]) {
    for (const fingerSpacing of [100.1, 200]) {
      const result = calculateElectrical({ ...defaultSettings, fingerWidth, fingerSpacing }, true, true)
      assert.ok(Number.isFinite(result.mpp.power) && result.mpp.power >= 0 && result.mpp.power <= 1000)
      assert.ok(result.photocurrent >= 0)
    }
  }
})

test('reference results are available as an explicit review checkpoint', (context) => {
  const result = calculateElectrical(defaultSettings, true, true)
  context.diagnostic(JSON.stringify({ sourcePowerWm2: referenceSpectrumPower, photocurrentA: result.photocurrent, seriesResistanceOhms: result.seriesResistance, mpp: result.mpp }))
})
