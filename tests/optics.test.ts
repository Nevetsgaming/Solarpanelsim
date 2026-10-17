import test from 'node:test'
import assert from 'node:assert/strict'
import { siliconAbsorption } from '../src/data/silicon.ts'
import { absorptionCoefficient, bandgapWavelengthNm, calculateOptics, photonEnergyEv } from '../src/physics/optics.ts'

function approximately(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) <= Math.max(1e-12, Math.abs(expected) * 1e-10))
}

test('500 nm photons have about 2.48 eV; doubling wavelength halves energy', () => {
  assert.ok(Math.abs(photonEnergyEv(500) - 2.47968) < 0.00001)
  approximately(photonEnergyEv(1000), photonEnergyEv(500) / 2)
})

test('fixed optical power gives twice the photon rate at twice the wavelength', () => {
  approximately(calculateOptics(1000, 180).photonFlux, 2 * calculateOptics(500, 180).photonFlux)
})

test('interpolation preserves every source knot and stays between adjacent values', () => {
  for (const [wavelength, alpha] of siliconAbsorption) {
    approximately(absorptionCoefficient(wavelength), alpha)
  }
  approximately(absorptionCoefficient(1005), Math.sqrt(64 * 51.1))
})

test('absorption uses centimetres consistently and is zero at zero thickness', () => {
  approximately(calculateOptics(1000, 100).absorbedFraction, 1 - Math.exp(-64 * 0.01))
  assert.equal(calculateOptics(1000, 0).absorbedFraction, 0)
})

test('equal thickness increases give diminishing absorption gains', () => {
  const fractions = [0, 50, 100, 150, 200].map((thickness) => calculateOptics(1000, thickness).absorbedFraction)
  const gains = fractions.slice(1).map((value, index) => value - fractions[index])
  for (let index = 1; index < gains.length; index++) {
    assert.ok(gains[index] > 0 && gains[index] < gains[index - 1])
  }
})

test('bandgap gate separates measured absorption from permitted generation', () => {
  assert.ok(bandgapWavelengthNm > 1106 && bandgapWavelengthNm < 1108)
  assert.equal(calculateOptics(1106, 180).canGeneratePairs, true)
  assert.equal(calculateOptics(1108, 180).canGeneratePairs, false)
  const infrared = calculateOptics(1200, 180)
  assert.ok(infrared.absorbedFraction > 0)
  assert.equal(infrared.usableAbsorbedFraction, 0)
})

test('absorption remains bounded throughout slider ranges', () => {
  for (let wavelength = 300; wavelength <= 1200; wavelength++) {
    for (const thickness of [50, 180, 300]) {
      const result = calculateOptics(wavelength, thickness)
      assert.ok(result.absorbedFraction >= 0 && result.absorbedFraction <= 1)
      assert.ok(result.usableAbsorbedFraction <= result.absorbedFraction)
    }
  }
})

test('invalid inputs are rejected instead of extrapolated silently', () => {
  for (const wavelength of [0, 299, 1201, NaN, Infinity]) {
    assert.throws(() => calculateOptics(wavelength, 180), RangeError)
  }
  for (const thickness of [-1, NaN, Infinity]) {
    assert.throws(() => calculateOptics(550, thickness), RangeError)
  }
})
