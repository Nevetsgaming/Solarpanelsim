import { bandgapWavelengthNm, calculateOptics, incidentPowerPerArea, siliconBandgapEv } from '../physics/optics'

type OpticsReadoutProps = {
  wavelengthNm: number
  thicknessUm: number
  hasSilicon: boolean
  reflectedPercent: number
}

export default function OpticsReadout({ wavelengthNm, thicknessUm, hasSilicon, reflectedPercent }: OpticsReadoutProps) {
  const optics = calculateOptics(wavelengthNm, thicknessUm, reflectedPercent)
  function percentage(fraction: number) {
    const percent = fraction * 100
    return percent > 0 && percent < 0.1 ? percent.toPrecision(2) : percent.toFixed(1)
  }

  return (
    <section className="optics-readout" aria-labelledby="optics-title">
      <h3 id="optics-title">Light & absorption</h3>
      <dl>
        <div><dt>Silicon bandgap</dt><dd>{siliconBandgapEv} eV</dd></div>
      </dl>
      <p>{optics.canGeneratePairs
        ? 'Enough energy to generate an electron–hole pair if absorbed.'
        : 'Below bandgap: no electron–hole generation in this model.'}</p>
      <p>Threshold ≈ {Math.round(bandgapWavelengthNm)} nm. Optical input stays at {incidentPowerPerArea} W/m² as wavelength changes.</p>

      {hasSilicon ? (
        <>
          <dl>
            <div><dt>Single-pass absorption</dt><dd>{percentage(optics.absorbedFraction)}%</dd></div>
            <div><dt>Light reflected</dt><dd>{reflectedPercent}%</dd></div>
            <div><dt>Absorbed, of incoming light</dt><dd>{percentage(optics.absorbedIncidentFraction)}%</dd></div>
            <div><dt>Generation-capable, of incoming light</dt><dd>{percentage(optics.usableAbsorbedFraction)}%</dd></div>
          </dl>
          <meter min="0" max="1" value={optics.absorbedFraction} aria-label="Fraction absorbed in silicon" />
        </>
      ) : <p>Place silicon to measure absorption.</p>}

    </section>
  )
}
