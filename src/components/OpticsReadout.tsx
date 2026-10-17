import { bandgapWavelengthNm, calculateOptics, incidentPowerPerArea, siliconBandgapEv } from '../physics/optics'

type OpticsReadoutProps = {
  wavelengthNm: number
  thicknessUm: number
  hasSilicon: boolean
}

export default function OpticsReadout({ wavelengthNm, thicknessUm, hasSilicon }: OpticsReadoutProps) {
  const optics = calculateOptics(wavelengthNm, thicknessUm)
  function percentage(fraction: number) {
    const percent = fraction * 100
    return percent > 0 && percent < 0.1 ? percent.toPrecision(2) : percent.toFixed(1)
  }

  return (
    <section className="optics-readout" aria-labelledby="optics-title">
      <h3 id="optics-title">Light & absorption</h3>
      <dl>
        <div><dt>Photon energy</dt><dd>{optics.energyEv.toFixed(3)} eV</dd></div>
        <div><dt>Silicon bandgap</dt><dd>{siliconBandgapEv} eV</dd></div>
        <div><dt>Incoming photon rate</dt><dd>{optics.photonFlux.toExponential(2)} /s/m²</dd></div>
      </dl>
      <p>{optics.canGeneratePairs
        ? 'Enough energy to generate an electron–hole pair if absorbed.'
        : 'Below bandgap: no electron–hole generation in this model.'}</p>
      <p>Threshold ≈ {Math.round(bandgapWavelengthNm)} nm. Optical input stays at {incidentPowerPerArea} W/m² as wavelength changes.</p>

      {hasSilicon ? (
        <>
          <dl>
            <div><dt>Single-pass absorption</dt><dd>{percentage(optics.absorbedFraction)}%</dd></div>
            <div><dt>Generation-capable fraction</dt><dd>{percentage(optics.usableAbsorbedFraction)}%</dd></div>
          </dl>
          <meter min="0" max="1" value={optics.absorbedFraction} aria-label="Fraction absorbed in silicon" />
          <p>Of light entering {thicknessUm} µm of silicon. Try 1000 nm, then increase thickness: absorption gains get smaller.</p>
        </>
      ) : <p>Place silicon to measure absorption.</p>}

      <details>
        <summary>Equations & assumptions</summary>
        <p>E = hc/λ. E is photon energy; h is Planck’s constant; c is light speed; λ is wavelength, converted from nm to metres.</p>
        <p>A = 1 − exp(−αd). A is absorbed fraction; α is the absorption coefficient in cm⁻¹; d is thickness in cm (µm × 0.0001).</p>
        <p>Photon rate per area = optical power per area / energy per photon in joules.</p>
        <p>Data: <a href="https://doi.org/10.1016/j.solmat.2008.06.009" target="_blank" rel="noreferrer">Green (2008), Table 1, silicon at 300 K</a>. Logarithmic interpolation between 10 nm samples.</p>
        <p>Single pass only: reflection, shading, rear reflection and collection losses are not included yet. Measured absorption may be nonzero below the bandgap; the teaching model sets generation-capable absorption to zero below 1.12 eV.</p>
      </details>
    </section>
  )
}
