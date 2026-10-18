import { lightBudget } from '../physics/lightBudget'

type OpticsReadoutProps = {
  wavelengthNm: number
  thicknessUm: number
  hasSilicon: boolean
  reflectedPercent: number
  isSunlight: boolean
  unshadedFraction: number
}

export default function OpticsReadout({ wavelengthNm, thicknessUm, hasSilicon, reflectedPercent, isSunlight, unshadedFraction }: OpticsReadoutProps) {
  const { blocked, reflected, useful, unabsorbed, belowBandgap } = lightBudget(wavelengthNm, thicknessUm, reflectedPercent, unshadedFraction, isSunlight, hasSilicon)

  return (
    <section className="optics-readout" aria-labelledby="optics-title">
      <h3 id="optics-title">Where the light goes</h3>
      <p><strong>Out of 100 incoming photons</strong>—not 100 units of energy:</p>
      <dl>
        <div><dt>Blocked by metal</dt><dd>{(blocked * 100).toFixed(1)}</dd></div>
        <div><dt>Reflected away</dt><dd>{(reflected * 100).toFixed(1)}</dd></div>
        <div><dt>Too little energy</dt><dd>{(belowBandgap * 100).toFixed(1)}</dd></div>
        <div><dt>{hasSilicon ? 'Usable, but not absorbed' : 'Usable, but no silicon yet'}</dt><dd>{(unabsorbed * 100).toFixed(1)}</dd></div>
        <div><dt>Can generate charge</dt><dd>{(useful * 100).toFixed(1)}</dd></div>
      </dl>
      <meter min="0" max="1" value={useful} aria-label="Fraction of incoming photons that can generate charge" />
      <p>{blocked >= 1 ? 'The metal covers the whole surface. No light reaches the silicon, so power is zero.'
        : !hasSilicon ? 'Add silicon first so the cell can absorb light.'
        : reflectedPercent === 100 ? 'All the light that misses the metal is reflected. Reduce reflection to let it in.'
        : useful === 0 ? 'These photons cannot generate charge in silicon. Try a shorter wavelength.'
        : 'Use the rows to choose what to change next.'}</p>
      {hasSilicon && unabsorbed > 0.001 && <p>Usable but unabsorbed? Thicker silicon can capture more of these photons.</p>}
      {belowBandgap > 0.001 && <p>Too little energy? Thickness cannot fix that.{!isSunlight && ' Try a shorter wavelength.'}</p>}
      <p>Generating charge is not the same as delivering power: collection and electrical losses still matter.</p>
    </section>
  )
}
