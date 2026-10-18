import { calculateOptics } from './optics.ts'
import { absorbedSolarPhotonFlux, solarPhotonFlux, usableSolarPhotonFlux } from './spectrum.ts'

export function lightBudget(wavelengthNm: number, thicknessUm: number, reflectedPercent: number, unshadedFraction: number, isSunlight: boolean, hasSilicon: boolean) {
  const optics = calculateOptics(wavelengthNm, thicknessUm)
  const energeticFraction = isSunlight ? usableSolarPhotonFlux / solarPhotonFlux : optics.canGeneratePairs ? 1 : 0
  const absorbedFraction = isSunlight ? absorbedSolarPhotonFlux(thicknessUm) / solarPhotonFlux : optics.usableAbsorbedFraction
  const blocked = 1 - unshadedFraction
  const reflected = unshadedFraction * reflectedPercent / 100
  const entering = unshadedFraction - reflected
  const belowBandgap = entering * (1 - energeticFraction)
  const useful = hasSilicon ? entering * absorbedFraction : 0
  // Only count usable-energy photons here; low-energy photons have their own row.
  const unabsorbed = Math.max(0, entering * energeticFraction - useful)
  return { blocked, reflected, belowBandgap, unabsorbed, useful }
}
