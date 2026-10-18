import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ElectricalResults, OperatingPoint } from '../physics/electrical'
import { device, saturationCurrent } from '../physics/electrical'
import type { PartSettings } from '../partOptions'
import type { OperatingMode } from '../physics/electrical'
import type { ReadingTopic } from './PowerReadout'

type FormulaExplorerProps = {
  results: ElectricalResults
  operating: OperatingPoint
  settings: PartSettings
  isSunlight: boolean
  onClose: () => void
  topic?: ReadingTopic
  mode?: OperatingMode
}

export default function FormulaExplorer({ results, operating, settings, isSunlight, onClose, topic = 'power', mode = 'mpp' }: FormulaExplorerProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [formula, setFormula] = useState<'diode' | 'photocurrent'>('diode')
  const [selectedTerm, setSelectedTerm] = useState(topic === 'current' ? 'I' : topic === 'voltage' ? 'voltage' : 'power')

  useEffect(() => {
    const modal = dialog.current!
    modal.showModal()
    return () => modal.close()
  }, [])

  const definitions: Record<string, { name: string; text: string }> = {
    power: { name: 'Power = voltage × current', text: `Voltage is the electrical push and current is the flow of charge. Together they give the power delivered: ${operating.voltage.toFixed(4)} V × ${operating.current.toFixed(4)} A = ${operating.power.toFixed(3)} W. Both readings come from the same operating point.` },
    I: { name: 'Terminal current · A', text: `Current tells us how much electric charge flows through the circuit each second. Here it is ${operating.current.toFixed(4)} A. Read the equation as a balance: start with the current light could supply, then subtract the current lost inside the cell. What remains can flow through your load.` },
    voltage: { name: 'Voltage · V', text: `Think of voltage as the electrical push: it tells us how much energy each unit of charge can deliver. Here it is ${operating.voltage.toFixed(4)} V. ${mode === 'load' ? `Your resistor and the cell have to agree on the same current and voltage. We find that point using the diode equation together with V = I × Rload, where your load is ${settings.loadResistance} Ω.` : 'We try points along the cell’s current–voltage curve and choose the one where V × I is largest. That voltage is Vmp; it is not the open-circuit voltage, because no power flows when the circuit is open.'} Inside the cell, resistance uses up some of the electrical push, so the junction voltage is V + I Rs.` },
    Iph: { name: 'Photocurrent · A', text: `First, ask how much current the light can supply. After allowing for reflection, absorption, metal shading and charge collection, we get ${results.photocurrent.toFixed(3)} A. We still need to subtract the diode and leakage losses. Click Iph to see how we count the useful photons.` },
    Iideal: { name: 'Ideal photocurrent integral · A', text: `Imagine every usable photon absorbed in the silicon gives us one collected electron. That would give ${results.integralCurrent.toFixed(3)} A. This is our starting estimate; next we allow for light blocked by metal and charge that never reaches the contacts.` },
    diodeLoss: { name: 'Current lost through the diode', text: `Some light-generated charge recombines instead of reaching the circuit. This whole expression describes that loss, which rises rapidly as voltage increases and limits the voltage the cell can produce. V + I Rs is the internal junction voltage, including resistance losses (Rs = ${results.seriesResistance.toExponential(3)} Ω). Temperature (${device.temperatureK} K) and ideality (${device.idealityFactor}) set how quickly it rises; I0 (${saturationCurrent.toExponential(3)} A) sets its scale and is calibrated to the illustrative reference cell.` },
    leakage: { name: 'Current lost through a leakage path', text: `The internal voltage divided by shunt resistance gives the current that bypasses the useful circuit. A larger shunt resistance means less leakage. Here Rsh is fixed at ${device.shuntResistance} Ω.` },
    chargeArea: { name: 'Convert photons into current for this cell', text: `The spectrum is counted per square metre. Multiplying by the cell area A (${device.areaM2} m²) gives photons reaching this cell; multiplying by the charge q of one electron converts generated pairs per second into amperes. This ideal integral assumes one electron–hole pair per absorbed, usable photon.` },
    Phi: { name: 'How many photons arrive at each wavelength?', text: isSunlight ? 'Sunlight is a mixture of wavelengths, not just one colour. Φ(λ) tells us how many photons arrive at each wavelength, per second and per square metre. We use the ASTM G173 sunlight spectrum, scaled to 1000 W/m² across 280–4000 nm. We then check which of those photons silicon can actually use.' : `Here all the light has a wavelength of ${settings.wavelengthNm} nm. To count the photons, we divide the incoming light power by the energy of one photon. Since there is only one wavelength, we only need to check absorption at that wavelength.` },
    reflection: { name: 'Light remaining after reflection', text: `R is the reflected fraction set by your anti-reflection coating slider: ${settings.reflectedPercent}%. So (1 − R) means the ${(100 - settings.reflectedPercent).toFixed(1)}% that is not reflected and can enter the cell, before metal shading. In this simplified model R is the same for every wavelength; coating thickness only changes the visual.` },
    absorption: { name: 'Fraction absorbed inside the silicon', text: `Not all light entering the silicon is absorbed. This whole factor gives the fraction absorbed in one pass through ${settings.siliconThickness} µm of silicon. Thicker silicon generally absorbs more; α(λ), from Green (2008), describes how easily silicon absorbs each wavelength. The exponential is the fraction that gets through, so subtracting it from 1 gives the absorbed fraction.` },
    cutoff: { name: 'Bandgap wavelength cutoff · about 1107 nm', text: 'Silicon needs at least its bandgap energy (Eg = 1.12 eV) to generate an electron–hole pair. Photon energy is hc/λ, so hc/Eg converts that minimum energy into the longest usable wavelength: about 1107 nm. Longer-wavelength photons have too little energy and do not generate current in this model. This is a wavelength limit, not the bandgap energy itself.' },
    wavelengthSum: { name: 'Add up contributions across wavelengths', text: 'dλ means a tiny slice of the wavelength spectrum. The integral adds the photon contributions from all these slices up to the bandgap cutoff. For sunlight the code performs this sum numerically using the source spectrum.' },
    integral: { name: 'Sum over usable wavelengths', text: 'Think of the integral as adding up lots of small contributions. For each wavelength, we count the arriving photons, remove the reflected ones, and keep the ones absorbed by silicon. We stop at hc/Eg because longer wavelengths do not have enough energy to generate charge. Light that silicon cannot use still counts as incoming energy, but not as electrical output.' },
    eta: { name: 'Collection efficiency', text: `Absorbing a photon is only the first step. The charges it creates also need to reach the contacts before they recombine. Here we assume ${device.collectionEfficiency * 100}% make it, so we multiply our estimate by ${device.collectionEfficiency}. This is a fixed teaching assumption, not a measured value for your design.` },
    shade: { name: 'Unshaded fraction', text: `Metal helps carry current, but light cannot enter through the area it covers. In your design, ${(results.unshadedFraction * 100).toFixed(2)}% of the surface is uncovered. We multiply by that fraction to allow for shading. Where fingers cross busbars, we count the blocked area only once.` },
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
        <header className="formula-dialog-header"><h2 id="formula-heading">How {topic} is calculated</h2><button type="button" className="formula-close" onClick={onClose} aria-label="Close formula explorer">×</button></header>
        <p className="formula-instruction">Hover a highlighted group to learn what it does. Tap on touch screens. Select I<sub>ph</sub> to look inside it.</p>
        <div className="formula-line power-equation">{term('power', 'P = V × I')}</div>
        {topic === 'voltage' && <div className="formula-line">{term('voltage', mode === 'load' ? 'V = I × Rload' : 'Vmp: the voltage where V × I is largest')}</div>}
        <nav className="formula-navigation" aria-label="Formula"><button type="button" aria-current={formula === 'diode' ? 'page' : undefined} onClick={() => { setFormula('diode'); setSelectedTerm('Iph') }}>Single diode</button><span aria-hidden="true">›</span><button type="button" aria-current={formula === 'photocurrent' ? 'page' : undefined} onClick={() => { setFormula('photocurrent'); setSelectedTerm('integral') }}>Photocurrent integral</button></nav>

        {formula === 'diode' ? (
          <div className="formula-line" aria-label="Illuminated single-diode equation with series and shunt resistance">
            {term('I', 'I')} = {term('Iph', <>I<sub>ph</sub></>, true)} − {term('diodeLoss', <>I<sub>0</sub> [exp(<span className="formula-fraction"><span>q(V + IR<sub>s</sub>)</span><span>nkT</span></span>) − 1]</>)} − {term('leakage', <span className="formula-fraction"><span>V + IR<sub>s</sub></span><span>R<sub>sh</sub></span></span>)}
          </div>
        ) : (
          <>
            <div className="formula-line integral-equation" aria-label="Photocurrent integral from the supplied screenshot">
              {term('Iideal', <>I<sub>ph,ideal</sub></>)} = {term('chargeArea', 'qA')}
              <span className="formula-integral"><sup>{term('cutoff', <>hc/E<sub>g</sub></>)}</sup>{term('integral', '∫')}<sub>0</sub></span>
              {term('Phi', 'Φ(λ)')} {term('reflection', '[1 − R]')} {term('absorption', <>[1 − e<sup>−α(λ)d</sup>]</>)} {term('wavelengthSum', 'dλ')}
            </div>
            <div className="formula-line">{term('Iph', <>I<sub>ph</sub></>)} = {term('Iideal', <>I<sub>ph,ideal</sub></>)} × {term('eta', <>η<sub>c</sub></>)} × {term('shade', '(1 − fmetal)')}</div>
          </>
        )}
        <div className="term-explanation" aria-live="polite"><h3>{definitions[selectedTerm].name}</h3><p>{definitions[selectedTerm].text}</p></div>
        {!results.assembled && <p>Finish adding the four layers first. Until then, these numbers describe the design you are setting up, not a working cell.</p>}
        <details className="model-assumptions"><summary>Parameters, calibration & sources</summary>
          <p>We keep temperature, charge collection and a few electrical properties fixed so you can focus on your design. This is a simplified 1 m² cell for learning—not a prediction of a real panel’s output.</p>
          <p><a href="https://www.nlr.gov/grid/solar-resource/spectra-am1.5" target="_blank" rel="noreferrer">ASTM G173 AM1.5 spectrum</a> · <a href="https://doi.org/10.1016/j.solmat.2008.06.009" target="_blank" rel="noreferrer">Silicon absorption data</a> · <a href="https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/single-diode-equivalent-circuit-models/" target="_blank" rel="noreferrer">Single-diode model</a></p>
        </details>
      </div>
    </dialog>
  )
}
