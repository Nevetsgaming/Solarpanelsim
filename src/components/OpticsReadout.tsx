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

    </section>
  )
}
