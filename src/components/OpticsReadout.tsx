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
        ? 'Each photon has enough energy to free an electron if the silicon absorbs it. That leaves a hole behind; together they can contribute to current.'
        : 'These photons do not have enough energy to free an electron across silicon’s bandgap. They cannot generate current in this model, even if some light is absorbed.'}</p>
      <p>Silicon’s longest usable wavelength is about {Math.round(bandgapWavelengthNm)} nm. We keep incoming light power at {incidentPowerPerArea} W/m² as you change wavelength, so you are comparing the same amount of light energy.</p>

      {hasSilicon ? (
        <>
          <dl>
            <div><dt>Single-pass absorption</dt><dd>{percentage(optics.absorbedFraction)}%</dd></div>
            <div><dt>Light reflected</dt><dd>{reflectedPercent}%</dd></div>
            <div><dt>Absorbed, before metal shading</dt><dd>{percentage(optics.absorbedIncidentFraction)}%</dd></div>
            <div><dt>Generation-capable, before shading</dt><dd>{percentage(optics.usableAbsorbedFraction)}%</dd></div>
          </dl>
          <meter min="0" max="1" value={optics.absorbedFraction} aria-label="Fraction absorbed in silicon" />
        </>
      ) : <p>Add the silicon layer and we can see how much of this light it absorbs.</p>}

    </section>
  )
}
