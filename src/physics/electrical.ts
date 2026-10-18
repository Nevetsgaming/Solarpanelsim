import type { PartSettings } from '../partOptions.ts'
import { defaultSettings } from '../partOptions.ts'
import { panelGeometry } from '../panelGeometry.ts'
import { calculateOptics, electronCharge } from './optics.ts'
import { absorbedSolarPhotonFlux } from './spectrum.ts'

// Illustrative fixed device assumptions, not measured panel specifications.
export const device = {
  areaM2: panelGeometry.widthMm * panelGeometry.heightMm / 1e6,
  temperatureK: 300,
  idealityFactor: 1.2,
  collectionEfficiency: 0.95,
  sheetResistance: 80, // ohms/square
  metalResistivity: 1.59e-8, // ohm m, illustrative silver fingers
  fixedSeriesResistance: 0.00005, // ohms
  shuntResistance: 100, // ohms
  referenceVoc: 0.65, // V: calibration target at the default solar-spectrum design
}
export const boltzmannConstant = 1.380649e-23 // J/K
export const thermalVoltage = boltzmannConstant * device.temperatureK / electronCharge
const diodeVoltageScale = device.idealityFactor * thermalVoltage

export function contactLosses(settings: PartSettings) {
  const widthMm = settings.fingerWidth / 1000
  const pitchMm = settings.fingerSpacing
  let coveredWidthMm = 0
  for (let centre = pitchMm / 2; centre < panelGeometry.widthMm; centre += pitchMm) {
    coveredWidthMm += Math.max(0, Math.min(panelGeometry.widthMm, centre + widthMm / 2) - Math.max(0, centre - widthMm / 2))
  }
  const fingerShade = Math.min(1, coveredWidthMm / panelGeometry.widthMm)
  const busbarShade = panelGeometry.busbarPositionsMm.length * panelGeometry.busbarWidthMm / panelGeometry.heightMm
  // Union of fingers and busbars: do not count their overlapping areas twice.
  const unshadedFraction = (1 - fingerShade) * (1 - busbarShade)

  const pitchM = pitchMm / 1000
  const fingerWidthM = settings.fingerWidth * 1e-6
  const fingerHeightM = panelGeometry.fingerHeightUm * 1e-6
  const lengthM = panelGeometry.heightMm / 1000
  const busbars = panelGeometry.busbarPositionsMm.map((position) => position / 1000)
  const segments = [busbars[0], lengthM - busbars[busbars.length - 1]]
  for (let index = 1; index < busbars.length; index++) {
    const halfGap = (busbars[index] - busbars[index - 1]) / 2
    segments.push(halfGap, halfGap)
  }
  const meanCollectionDistanceSquared = segments.reduce((sum, length) => sum + length ** 3 / 3, 0) / lengthM
  const fingerResistance = device.metalResistivity * pitchM * meanCollectionDistanceSquared / (fingerWidthM * fingerHeightM * device.areaM2)
  const surfaceResistance = device.sheetResistance * pitchM ** 2 / (12 * device.areaM2)
  return { unshadedFraction, fingerResistance, surfaceResistance, seriesResistance: fingerResistance + surfaceResistance + device.fixedSeriesResistance }
}

export function photocurrent(settings: PartSettings, isSunlight: boolean) {
  const absorbedFlux = isSunlight
    ? absorbedSolarPhotonFlux(settings.siliconThickness)
    : (() => {
      const optics = calculateOptics(settings.wavelengthNm, settings.siliconThickness)
      return optics.photonFlux * optics.usableAbsorbedFraction
    })()
  const integralCurrent = electronCharge * device.areaM2 * absorbedFlux * (1 - settings.reflectedPercent / 100)
  const contacts = contactLosses(settings)
  return { integralCurrent, photocurrent: integralCurrent * device.collectionEfficiency * contacts.unshadedFraction, ...contacts }
}

// Calibrate I0 once to the stated reference Voc, including the reference shunt leak.
export const referencePhotocurrent = photocurrent(defaultSettings, true).photocurrent
export const saturationCurrent = (referencePhotocurrent - device.referenceVoc / device.shuntResistance) / Math.expm1(device.referenceVoc / diodeVoltageScale)

export type OperatingPoint = { voltage: number; current: number; power: number }
export type OperatingMode = 'mpp' | 'load'

export function diodeCurrent(junctionVoltage: number, lightCurrent: number) {
  return lightCurrent - saturationCurrent * Math.expm1(junctionVoltage / diodeVoltageScale) - junctionVoltage / device.shuntResistance
}

function bisect(low: number, high: number, residual: (value: number) => number) {
  for (let iteration = 0; iteration < 70; iteration++) {
    const middle = (low + high) / 2
    if (residual(middle) > 0) high = middle
    else low = middle
  }
  return (low + high) / 2
}

export function solveElectrical(lightCurrent: number, seriesResistance: number, loadResistance: number) {
  if (!Number.isFinite(lightCurrent) || lightCurrent < 0 || !Number.isFinite(seriesResistance) || seriesResistance < 0 || !Number.isFinite(loadResistance) || loadResistance <= 0) {
    throw new RangeError('Use nonnegative photocurrent/series resistance and positive finite load resistance.')
  }
  const zero = { voltage: 0, current: 0, power: 0 }
  if (lightCurrent === 0) return { mpp: zero, load: zero, openCircuitVoltage: 0 }
  const upperVoltage = diodeVoltageScale * Math.log1p(lightCurrent / saturationCurrent)
  const openCircuitVoltage = bisect(0, upperVoltage, (voltage) => -diodeCurrent(voltage, lightCurrent))
  function point(junctionVoltage: number): OperatingPoint {
    const current = Math.max(0, diodeCurrent(junctionVoltage, lightCurrent))
    const voltage = Math.max(0, junctionVoltage - current * seriesResistance)
    return { current, voltage, power: current * voltage }
  }
  const shortCircuitJunction = bisect(0, openCircuitVoltage, (voltage) => voltage - diodeCurrent(voltage, lightCurrent) * seriesResistance)
  let left = shortCircuitJunction
  let right = openCircuitVoltage
  // P(U) has a single maximum on the generating branch. Search along the I–V curve.
  for (let iteration = 0; iteration < 85; iteration++) {
    const first = left + (right - left) / 3
    const second = right - (right - left) / 3
    if (point(first).power < point(second).power) left = first
    else right = second
  }
  const loadJunction = bisect(shortCircuitJunction, openCircuitVoltage, (voltage) => voltage - diodeCurrent(voltage, lightCurrent) * (seriesResistance + loadResistance))
  return { mpp: point((left + right) / 2), load: point(loadJunction), openCircuitVoltage }
}

export function calculateElectrical(settings: PartSettings, isSunlight: boolean, assembled: boolean) {
  const photo = photocurrent(settings, isSunlight)
  const result = solveElectrical(assembled ? photo.photocurrent : 0, photo.seriesResistance, settings.loadResistance)
  return { ...photo, ...result, assembled }
}

export type ElectricalResults = ReturnType<typeof calculateElectrical>
