import { bandgapWavelengthNm } from '../physics/optics'

export default function WavelengthGuide({ wavelengthNm, isSunlight }: { wavelengthNm: number; isSunlight: boolean }) {
  const cutoff = Math.round(bandgapWavelengthNm)
  const selectedRange = wavelengthNm < 700 ? 0 : wavelengthNm < 1000 ? 1 : wavelengthNm <= bandgapWavelengthNm ? 2 : 3
  const ranges = [
    { name: '300–700 nm · high-energy photons', text: 'Enough energy to generate charge if absorbed. For the same light power, there are fewer photons; their extra energy does not release extra electrons in this model.' },
    { name: '700–1000 nm · more photons per watt', text: 'Each photon carries less energy, so the same light power supplies more photons. They can still generate charge, but absorption weakens toward longer wavelengths.' },
    { name: `1000–≈${cutoff} nm · absorption becomes weak`, text: 'Photons still have enough energy, but many pass through thin silicon without being absorbed. Increasing thickness can make a noticeable difference here.' },
    { name: `Above ≈${cutoff} nm · below the bandgap`, text: 'Each photon has too little energy to generate an electron–hole pair in this model. More photons or thicker silicon cannot fix that energy shortage.' },
  ]

  return (
    <details className="wavelength-guide">
      <summary>Wavelength guide</summary>
      {isSunlight && <p>Sunlight mixes all these ranges. “More photons per watt” compares equal light power; the actual amount in each range comes from the solar spectrum.</p>}
      <dl>{ranges.map((range, index) => <div key={range.name} data-current={!isSunlight && selectedRange === index ? 'true' : undefined}>
        <dt>{range.name}{!isSunlight && selectedRange === index && <span className="range-selected"> · selected</span>}</dt>
        <dd>{range.text}</dd>
      </div>)}</dl>
      <p className="small-note">700 and 1000 nm are guideposts, not sharp physical boundaries. Each absorbed, usable photon can create one pair.</p>
      <a href="https://www.pveducation.org/pvcdrom/solar-cell-operation/spectral-response" target="_blank" rel="noopener noreferrer">Learn about spectral response</a>
    </details>
  )
}
