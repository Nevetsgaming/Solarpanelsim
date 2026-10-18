import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ElectricalResults, OperatingPoint } from '../physics/electrical'
import { boltzmannConstant, device, saturationCurrent } from '../physics/electrical'
import type { PartSettings } from '../partOptions'

type FormulaExplorerProps = {
  results: ElectricalResults
  operating: OperatingPoint
  settings: PartSettings
  isSunlight: boolean
  onClose: () => void
}

export default function FormulaExplorer({ results, operating, settings, isSunlight, onClose }: FormulaExplorerProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [formula, setFormula] = useState<'diode' | 'photocurrent'>('diode')
  const [selectedTerm, setSelectedTerm] = useState('Iph')

  useEffect(() => {
    const modal = dialog.current!
    modal.showModal()
    return () => modal.close()
  }, [])

  const definitions: Record<string, { name: string; text: string }> = {
    P: { name: 'Electrical power · W', text: `Power delivered at this operating point: ${operating.power.toFixed(3)} W. Voltage and current are evaluated together, not taken from different points on the curve.` },
    I: { name: 'Terminal current · A', text: `${operating.current.toFixed(4)} A flows through the external circuit. Light-generated current is reduced by diode recombination and shunt leakage.` },
    V: { name: 'Terminal voltage · V', text: `${operating.voltage.toFixed(4)} V across the external circuit. In resistor mode, V = I × Rload. In maximum-power mode, the controller selects Vmp.` },
    Iph: { name: 'Photocurrent · A', text: `${results.photocurrent.toFixed(3)} A in the assembled model. This is the light-generated current before diode and shunt losses. Click Iph to open the integral from your screenshot.` },
    Iideal: { name: 'Ideal photocurrent integral · A', text: `${results.integralCurrent.toFixed(3)} A from the screenshot integral, after reflection and absorption, before collection efficiency and metal shading.` },
    I0: { name: 'Diode saturation current · A', text: `${saturationCurrent.toExponential(3)} A. Calibrated once to a 0.65 V open-circuit reference at the default AM1.5G design. This is an illustrative calibration, not a measured panel rating.` },
    Rs: { name: 'Series resistance · Ω', text: `${results.seriesResistance.toExponential(3)} Ω total: metal fingers ${results.fingerResistance.toExponential(3)} Ω, lateral surface flow ${results.surfaceResistance.toExponential(3)} Ω, and fixed resistance ${device.fixedSeriesResistance} Ω. The junction voltage is V + I Rs.` },
    Rsh: { name: 'Shunt resistance · Ω', text: `${device.shuntResistance} Ω, a fixed illustrative assumption. Some current leaks through this parallel path instead of reaching the load.` },
    q: { name: 'Elementary charge · C', text: '1.602176634 × 10⁻¹⁹ coulombs. Multiplying the number of collected electron–hole pairs per second by q gives current in amperes.' },
    n: { name: 'Diode ideality factor', text: `${device.idealityFactor}, dimensionless. A fixed illustrative parameter describing departure from an ideal diffusion diode.` },
    k: { name: 'Boltzmann constant · J/K', text: `${boltzmannConstant.toExponential(8)} joules per kelvin. Together with temperature it sets the thermal energy scale.` },
    T: { name: 'Temperature · K', text: `${device.temperatureK} K, fixed near room temperature. kT/q is the thermal voltage.` },
    exp: { name: 'Exponential function', text: 'exp(x) means e raised to x. The exponential rise in diode current limits voltage; extra light does not increase voltage proportionally.' },
    A: { name: 'Illuminated footprint · m²', text: `${device.areaM2} m²: the fixed 1 m × 1 m teaching cell. Metal shading is accounted for separately, once.` },
    Phi: { name: 'Incident photon spectrum · photons/(s m² nm)', text: isSunlight ? 'ASTM G173 AM1.5 global-tilt irradiance divided by photon energy, then normalized so total optical input is 1000 W/m² over 280–4000 nm. Photons above the cutoff wavelength do not generate pairs.' : `Constant-wavelength illumination at ${settings.wavelengthNm} nm: a spectral line whose total photon rate is optical power divided by photon energy. The integral reduces to evaluating absorption at that wavelength.` },
    lambda: { name: 'Wavelength · nm', text: 'The integral sums contributions from different wavelengths. Code integrates in nanometres; photon-energy calculations convert nm to metres.' },
    r: { name: 'Reflected fraction', text: `${settings.reflectedPercent}% is reflected. The remaining ${(100 - settings.reflectedPercent).toFixed(1)}% enters before metal shading. The model treats r as wavelength-independent and uses the slider, not a thin-film calculation.` },
    t: { name: 'Coating thickness · nm', text: `${settings.coatingThickness} nm. Your screenshot allows r to depend on wavelength and thickness. Here thickness changes the drawing only; reflection is controlled independently.` },
    alpha: { name: 'Silicon absorption coefficient · cm⁻¹', text: 'From Green (2008), Table 1 at 300 K, interpolated in log(alpha). A larger value means light is absorbed over a shorter distance.' },
    d: { name: 'Absorber thickness · cm', text: `${settings.siliconThickness} µm = ${(settings.siliconThickness * 1e-4).toPrecision(4)} cm. Alpha and d use matching length units. 1 − exp(−alpha d) is the single-pass absorbed fraction.` },
    h: { name: 'Planck constant · J s', text: '6.62607015 × 10⁻³⁴ joule-seconds. Photon energy is hc/λ.' },
    c: { name: 'Speed of light · m/s', text: '299792458 metres per second in vacuum.' },
    Eg: { name: 'Silicon bandgap · eV', text: '1.12 eV, treated as a sharp teaching threshold near 1107 nm. For hc/Eg in SI units, convert Eg to joules and the resulting wavelength to nm.' },
    integral: { name: 'Sum over usable wavelengths', text: 'The upper limit is hc/Eg. The numerical sunlight integral uses all source samples below that limit and splits the last interval at the cutoff. The source starts at 280 nm; wavelengths beyond the bandgap still count toward incoming optical power.' },
    eta: { name: 'Collection efficiency', text: `${device.collectionEfficiency * 100}%, fixed. Not every generated pair is collected; this factor is applied once after the ideal photocurrent integral.` },
    shade: { name: 'Unshaded fraction', text: `${(results.unshadedFraction * 100).toFixed(2)}% of the surface is not covered by metal. Fingers and busbar overlaps are counted once. This factor is applied once after the integral.` },
  }

  function term(id: string, label: ReactNode, drillDown = false) {
    return <button type="button" className="formula-term" aria-label={`${definitions[id].name}${drillDown ? ': open photocurrent integral' : ''}`}
      onMouseEnter={() => setSelectedTerm(id)} onFocus={() => setSelectedTerm(id)}
      onClick={() => { setSelectedTerm(id); if (drillDown) { setFormula('photocurrent'); setSelectedTerm('integral') } }}
      title={definitions[id].text}>{label}</button>
  }

  return (
    <dialog ref={dialog} className="formula-dialog" aria-labelledby="formula-heading" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="formula-dialog-content">
        <header className="formula-dialog-header"><h2 id="formula-heading">How power is calculated</h2><button type="button" className="formula-close" onClick={onClose} aria-label="Close formula explorer">×</button></header>
        <p className="formula-instruction">Hover a term to explain it. Click a term on touch screens. Select I<sub>ph</sub> to look inside it.</p>
        <div className="formula-line power-equation">{term('P', 'P')} = {term('V', 'V')} × {term('I', 'I')}</div>
        <nav className="formula-navigation" aria-label="Formula"><button type="button" aria-current={formula === 'diode' ? 'page' : undefined} onClick={() => { setFormula('diode'); setSelectedTerm('Iph') }}>Single diode</button><span aria-hidden="true">›</span><button type="button" aria-current={formula === 'photocurrent' ? 'page' : undefined} onClick={() => { setFormula('photocurrent'); setSelectedTerm('integral') }}>Photocurrent integral</button></nav>

        {formula === 'diode' ? (
          <div className="formula-line" aria-label="Illuminated single-diode equation with series and shunt resistance">
            {term('I', 'I')} = {term('Iph', <>I<sub>ph</sub></>, true)} − {term('I0', <>I<sub>0</sub></>)} [{term('exp', 'exp')}(
            <span className="formula-fraction"><span>{term('q', 'q')}({term('V', 'V')} + {term('I', 'I')}{term('Rs', <>R<sub>s</sub></>)})</span><span>{term('n', 'n')}{term('k', 'k')}{term('T', 'T')}</span></span>) − 1] −
            <span className="formula-fraction"><span>{term('V', 'V')} + {term('I', 'I')}{term('Rs', <>R<sub>s</sub></>)}</span><span>{term('Rsh', <>R<sub>sh</sub></>)}</span></span>
          </div>
        ) : (
          <>
            <div className="formula-line integral-equation" aria-label="Photocurrent integral from the supplied screenshot">
              {term('Iideal', <>I<sub>ph,ideal</sub></>)} = {term('q', 'q')}{term('A', 'A')}
              <span className="formula-integral"><sup>{term('h', 'h')}{term('c', 'c')}/{term('Eg', <>E<sub>g</sub></>)}</sup>{term('integral', '∫')}<sub>0</sub></span>
              {term('Phi', 'Φ')}({term('lambda', 'λ')})[1 − {term('r', 'r')}({term('lambda', 'λ')}, {term('t', 't')})][1 − {term('exp', 'e')}<sup>−{term('alpha', 'α')}({term('lambda', 'λ')}){term('d', 'd')}</sup>] d{term('lambda', 'λ')}
            </div>
            <div className="formula-line">{term('Iph', <>I<sub>ph</sub></>)} = {term('Iideal', <>I<sub>ph,ideal</sub></>)} × {term('eta', <>η<sub>c</sub></>)} × {term('shade', '(1 − fmetal)')}</div>
          </>
        )}
        <div className="term-explanation" aria-live="polite"><h3>{definitions[selectedTerm].name}</h3><p>{definitions[selectedTerm].text}</p></div>
        {!results.assembled && <p>Assemble all four layers to enable electrical output.</p>}
        <details className="model-assumptions"><summary>Parameters, calibration & sources</summary>
          <p>Fixed assumptions: {device.temperatureK} K, n = {device.idealityFactor}, collection {device.collectionEfficiency * 100}%, surface sheet resistance {device.sheetResistance} Ω/square, Rsh = {device.shuntResistance} Ω, ideal busbars. I0 is calibrated to the stated reference Voc, not fitted to a measured device. This is one continuous 1 m² teaching cell, not a series-connected commercial module.</p>
          <p><a href="https://www.nlr.gov/grid/solar-resource/spectra-am1.5" target="_blank" rel="noreferrer">ASTM G173 AM1.5 spectrum</a> · <a href="https://doi.org/10.1016/j.solmat.2008.06.009" target="_blank" rel="noreferrer">Silicon absorption data</a> · <a href="https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/single-diode-equivalent-circuit-models/" target="_blank" rel="noreferrer">Single-diode model</a></p>
        </details>
      </div>
    </dialog>
  )
}
