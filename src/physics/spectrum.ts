import { solarSpectrum } from '../data/solarSpectrum.ts'
import { absorptionCoefficient, bandgapWavelengthNm, incidentPowerPerArea, photonEnergyJoules } from './optics.ts'

// Integrate spectral irradiance over its entire 280–4000 nm range before normalization.
// Infrared power stays in the denominator even though it cannot generate pairs here.
export const referenceSpectrumPower = solarSpectrum.slice(1).reduce((sum, [wavelength, irradiance], index) => {
  const [previousWavelength, previousIrradiance] = solarSpectrum[index]
  return sum + (irradiance + previousIrradiance) / 2 * (wavelength - previousWavelength)
}, 0)

const normalization = incidentPowerPerArea / referenceSpectrumPower

export const solarPhotonFlux = solarSpectrum.slice(1).reduce((sum, [wavelength, irradiance], index) => {
  const [previousWavelength, previousIrradiance] = solarSpectrum[index]
  return sum + (irradiance / photonEnergyJoules(wavelength) + previousIrradiance / photonEnergyJoules(previousWavelength)) / 2 * (wavelength - previousWavelength) * normalization
}, 0)

// Photon count above the bandgap, whether or not the silicon absorbs them.
export const usableSolarPhotonFlux = solarSpectrum.slice(1).reduce((sum, [end, endIrradiance], index) => {
  const [start, startIrradiance] = solarSpectrum[index]
  if (start >= bandgapWavelengthNm) return sum
  const upper = Math.min(end, bandgapWavelengthNm)
  const upperIrradiance = startIrradiance + (endIrradiance - startIrradiance) * (upper - start) / (end - start)
  return sum + (startIrradiance / photonEnergyJoules(start) + upperIrradiance / photonEnergyJoules(upper)) / 2 * (upper - start) * normalization
}, 0)

export function absorbedSolarPhotonFlux(thicknessUm: number) {
  if (!Number.isFinite(thicknessUm) || thicknessUm < 0) throw new RangeError('Thickness must be nonnegative and finite.')
  const thicknessCm = thicknessUm * 1e-4
  let absorbedPhotons = 0
  function integrand(wavelengthNm: number, irradiance: number) {
    const absorption = -Math.expm1(-absorptionCoefficient(wavelengthNm) * thicknessCm)
    return irradiance / photonEnergyJoules(wavelengthNm) * absorption
  }

  // Trapezoidal integration of Phi(lambda) * [1 - exp(-alpha*d)] d(lambda).
  // Split the segment at the exact bandgap cutoff rather than rounding it to a sample.
  for (let index = 1; index < solarSpectrum.length; index++) {
    const [start, startIrradiance] = solarSpectrum[index - 1]
    const [end, endIrradiance] = solarSpectrum[index]
    if (start >= bandgapWavelengthNm) break
    const upper = Math.min(end, bandgapWavelengthNm)
    const upperIrradiance = startIrradiance + (endIrradiance - startIrradiance) * (upper - start) / (end - start)
    absorbedPhotons += (integrand(start, startIrradiance) + integrand(upper, upperIrradiance)) / 2 * (upper - start)
  }
  return absorbedPhotons * normalization
}
