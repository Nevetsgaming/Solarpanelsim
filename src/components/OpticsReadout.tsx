import { calculateOptics } from '../physics/optics'
import { absorbedSolarPhotonFlux, solarPhotonFlux } from '../physics/spectrum'

type OpticsReadoutProps = {
  wavelengthNm: number
  thicknessUm: number
  hasSilicon: boolean
  reflectedPercent: number
  isSunlight: boolean
  unshadedFraction: number
}

export default function OpticsReadout({ wavelengthNm, thicknessUm, hasSilicon, reflectedPercent, isSunlight, unshadedFraction }: OpticsReadoutProps) {
  const absorption = isSunlight
    ? absorbedSolarPhotonFlux(thicknessUm) / solarPhotonFlux
    : calculateOptics(wavelengthNm, thicknessUm).usableAbsorbedFraction
  const blocked = 1 - unshadedFraction
  const reflected = unshadedFraction * reflectedPercent / 100
  const entering = unshadedFraction - reflected
  const useful = hasSilicon ? entering * absorption : 0
  const unused = Math.max(0, entering - useful)

  return (
    <section className="optics-readout" aria-labelledby="optics-title">
      <h3 id="optics-title">Where the light goes</h3>
      <p>For every 100 photons arriving at your cell, here’s what happens. Change a part to see where you can lose fewer.</p>
      <dl>
        <div><dt>Blocked by metal</dt><dd>{(blocked * 100).toFixed(1)}</dd></div>
        <div><dt>Reflected away</dt><dd>{(reflected * 100).toFixed(1)}</dd></div>
        <div><dt>{hasSilicon ? 'Not absorbed or too little energy' : 'No silicon to absorb them'}</dt><dd>{(unused * 100).toFixed(1)}</dd></div>
        <div><dt>Can generate charge</dt><dd>{(useful * 100).toFixed(1)}</dd></div>
      </dl>
      <meter min="0" max="1" value={useful} aria-label="Fraction of incoming photons that can generate charge" />
      <p>{blocked >= 1 ? 'The metal covers the whole surface. No light reaches the silicon, so power is zero.'
        : !hasSilicon ? 'Add silicon first so the cell can absorb light.'
        : reflectedPercent === 100 ? 'All the light that misses the metal is reflected. Reduce reflection to let it in.'
        : useful === 0 ? 'These photons cannot generate charge in silicon. Try a shorter wavelength.'
        : 'More useful photons can mean more current. But wider contacts also reduce resistance, so watch power as well—not just this bar.'}</p>
      <p>This counts photons, not energy efficiency. Some generated charge is still lost before it reaches your load.</p>
    </section>
  )
}
