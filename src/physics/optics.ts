import { siliconAbsorption } from '../data/silicon.ts'

export const planckConstant = 6.62607015e-34 // J s
export const speedOfLight = 299792458 // m/s
export const electronCharge = 1.602176634e-19 // C
const joulesPerElectronVolt = 1.602176634e-19

export const siliconBandgapEv = 1.12 // Teaching approximation near room temperature.
export const incidentPowerPerArea = 1000 // W/m², fixed illustrative input.

export function photonEnergyJoules(wavelengthNm: number) {
  if (!Number.isFinite(wavelengthNm) || wavelengthNm <= 0) {
    throw new RangeError('Wavelength must be a positive number in nm.')
  }
  return planckConstant * speedOfLight / (wavelengthNm * 1e-9)
}

export function photonEnergyEv(wavelengthNm: number) {
  return photonEnergyJoules(wavelengthNm) / joulesPerElectronVolt
}

export const bandgapWavelengthNm = planckConstant * speedOfLight / (siliconBandgapEv * joulesPerElectronVolt) * 1e9

export function absorptionCoefficient(wavelengthNm: number) {
  if (!Number.isFinite(wavelengthNm) || wavelengthNm < 280 || wavelengthNm > 1200) {
    throw new RangeError('Silicon data covers 280–1200 nm.')
  }

  // Interpolate log(alpha) between the two neighbouring table rows.
  for (let index = 1; index < siliconAbsorption.length; index++) {
    const [lowerWavelength, lowerAlpha] = siliconAbsorption[index - 1]
    const [upperWavelength, upperAlpha] = siliconAbsorption[index]
    if (wavelengthNm <= upperWavelength) {
      const fraction = (wavelengthNm - lowerWavelength) / (upperWavelength - lowerWavelength)
      return Math.exp(Math.log(lowerAlpha) + fraction * (Math.log(upperAlpha) - Math.log(lowerAlpha)))
    }
  }
  throw new RangeError('Wavelength is outside the table.')
}

export function calculateOptics(wavelengthNm: number, thicknessUm: number, reflectedPercent = 0) {
  if (!Number.isFinite(reflectedPercent) || reflectedPercent < 0 || reflectedPercent > 100) {
    throw new RangeError('Reflected light must be between 0 and 100 percent.')
  }
  if (!Number.isFinite(thicknessUm) || thicknessUm < 0) {
    throw new RangeError('Thickness must be a nonnegative number in µm.')
  }
  const energyJoules = photonEnergyJoules(wavelengthNm)
  const energyEv = photonEnergyEv(wavelengthNm)
  const alphaPerCm = absorptionCoefficient(wavelengthNm)
  const thicknessCm = thicknessUm * 1e-4
  const absorbedFraction = -Math.expm1(-alphaPerCm * thicknessCm)
  const reflectedFraction = reflectedPercent / 100
  const absorbedIncidentFraction = (1 - reflectedFraction) * absorbedFraction
  const transmittedIncidentFraction = (1 - reflectedFraction) * (1 - absorbedFraction)
  const canGeneratePairs = wavelengthNm <= bandgapWavelengthNm

  return {
    energyEv,
    alphaPerCm,
    absorbedFraction,
    reflectedFraction,
    absorbedIncidentFraction,
    transmittedIncidentFraction,
    canGeneratePairs,
    usableAbsorbedFraction: canGeneratePairs ? absorbedIncidentFraction : 0,
    photonFlux: incidentPowerPerArea / energyJoules, // photons/(s m²)
  }
}
