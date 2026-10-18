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

  const definitions: Record<string, { name: string; text: string; detail?: string }> = {
    power: { name: 'Power = voltage × current', text: `Voltage is the energy delivered per unit of charge; current is charge flowing per second. Together they give ${operating.power.toFixed(3)} W.`, detail: `At this point: ${operating.voltage.toFixed(4)} V × ${operating.current.toFixed(4)} A. Both readings come from the same point on the curve.` },
    I: { name: 'Terminal current · A', text: `Current tells us how much electric charge flows each second. Your circuit receives ${operating.current.toFixed(4)} A after internal losses.`, detail: 'Start with the light-generated current, then subtract the diode and leakage currents. The rest can flow through the external circuit.' },
    voltage: { name: 'Voltage · V', text: `Voltage is the electrical push: energy available per unit of charge. Here it is ${operating.voltage.toFixed(4)} V.`, detail: mode === 'load' ? `The cell and your ${settings.loadResistance} Ω resistor must agree on current and voltage. We solve the diode equation together with Ohm’s law.` : 'Maximum-power mode finds the point where voltage times current is largest. Open circuit gives more voltage, but no current—and therefore no power.' },
    Iph: { name: 'Photocurrent · A', text: `Useful light supplies ${results.photocurrent.toFixed(3)} A before diode and leakage losses. Select this group to see how we count the useful photons.`, detail: 'Reflection, absorption, metal shading and charge collection are already included. The circuit image calls this same quantity IL.' },
    Iideal: { name: 'Ideal photocurrent integral · A', text: `Our starting estimate is ${results.integralCurrent.toFixed(3)} A: one electron for each absorbed, usable photon.`, detail: 'This includes reflection and absorption. Next we account for metal shading and charges that are not collected.' },
    diodeLoss: { name: 'Current lost through the diode', text: 'As voltage rises, more current flows internally through the junction. We subtract it because it does not reach your device.', detail: `The internal voltage is V + I Rs. The model holds temperature at ${device.temperatureK} K and ideality at ${device.idealityFactor}. I0 is ${saturationCurrent.toExponential(3)} A, calibrated to the reference cell rather than a measured device.` },
    leakage: { name: 'Current lost through a leakage path', text: 'Some current takes an unwanted shortcut across the cell. Higher shunt resistance means less leakage.', detail: `Leakage current is internal voltage divided by shunt resistance, fixed here at ${device.shuntResistance} Ω.` },
    chargeArea: { name: 'Convert photon counts into current', text: 'Multiply by cell area to count photons reaching the whole cell. Multiply by electron charge to turn generated pairs per second into amperes.', detail: `Area is ${device.areaM2} m². The ideal integral assumes one electron–hole pair per absorbed photon with enough energy.` },
    Phi: { name: 'Photons arriving at each wavelength', text: isSunlight ? 'Sunlight contains many wavelengths. This group counts how many photons arrive at each one.' : `All your light is at ${settings.wavelengthNm} nm. We divide incoming power by one photon’s energy to count the photons.`, detail: isSunlight ? 'We use the ASTM G173 sunlight spectrum, scaled to 1000 W/m² over 280–4000 nm.' : 'Incoming power stays fixed. Longer wavelengths give more photons, but each carries less energy.' },
    reflection: { name: 'Light remaining after reflection', text: `${settings.reflectedPercent}% bounces away, leaving ${(100 - settings.reflectedPercent).toFixed(1)}% before metal shading.`, detail: 'R is the reflected fraction selected with the slider. It is constant across wavelengths here; coating thickness changes only the drawing.' },
    absorption: { name: 'Fraction absorbed inside the silicon', text: 'Some entering light passes through. This group keeps only the fraction absorbed during one pass through silicon.', detail: `The silicon is ${settings.siliconThickness} µm thick. Alpha describes how easily each wavelength is absorbed, using Green (2008). The exponential gives the fraction that gets through; subtracting from 1 gives the absorbed fraction.` },
    cutoff: { name: 'Bandgap wavelength cutoff · about 1107 nm', text: 'This is silicon’s longest usable wavelength. Longer-wavelength photons have too little energy to generate charge here.', detail: 'The bandgap is a minimum energy, Eg = 1.12 eV. Since photon energy is hc/λ, hc/Eg converts that energy threshold into a wavelength limit—not another energy value.' },
    wavelengthSum: { name: 'A small slice of wavelengths', text: 'Each small wavelength slice contributes some photons. The integral adds those contributions together.' },
    integral: { name: 'Add up the useful light', text: 'At each wavelength, count the photons that enter and are absorbed. Add them up, stopping at the bandgap cutoff.', detail: 'Longer wavelengths still count as incoming light energy, but cannot generate charge in this model.' },
    eta: { name: 'Collection efficiency', text: `Not every generated charge reaches a contact. We assume ${device.collectionEfficiency * 100}% is collected.`, detail: 'This is a fixed teaching assumption. It is applied once, after the ideal photon integral.' },
    shade: { name: 'Unshaded fraction', text: `${(results.unshadedFraction * 100).toFixed(2)}% of the surface is uncovered. Only light missing the metal can enter.`, detail: 'Finger and busbar overlaps are counted once. This factor is applied once after the integral.' },
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
        {topic === 'voltage' && <div className="formula-line">{term('voltage', mode === 'load' ? <>V = I × R<sub>load</sub></> : <>V<sub>mp</sub>: the voltage where V × I is largest</>)}</div>}
        <nav className="formula-navigation" aria-label="Formula"><button type="button" aria-current={formula === 'diode' ? 'page' : undefined} onClick={() => { setFormula('diode'); setSelectedTerm('Iph') }}>Single diode</button><span aria-hidden="true">›</span><button type="button" aria-current={formula === 'photocurrent' ? 'page' : undefined} onClick={() => { setFormula('photocurrent'); setSelectedTerm('integral') }}>Photocurrent integral</button></nav>

        {formula === 'diode' ? (
          <div className="formula-line" aria-label="Illuminated single-diode equation with series and shunt resistance">
            {term('I', 'I')} = {term('Iph', <>I<sub>ph</sub></>, true)} − {term('diodeLoss', <>I<sub>0</sub> [exp(<span className="formula-fraction"><span>q(V + IR<sub>s</sub>)</span><span>nkT</span></span>) − 1]</>)} − {term('leakage', <span className="formula-fraction"><span>V + IR<sub>s</sub></span><span>R<sub>sh</sub></span></span>)}
          </div>
        ) : (
          <>
            <div className="formula-line integral-equation" aria-label="Photocurrent integral from the supplied screenshot">
              {term('Iideal', <>I<sub>ph,ideal</sub></>)} = {term('chargeArea', 'qA')}
              <span className="formula-integral"><sup>{term('cutoff', <span className="formula-fraction"><span>hc</span><span>E<sub>g</sub></span></span>)}</sup>{term('integral', '∫')}<sub>0</sub></span>
              {term('Phi', 'Φ(λ)')} {term('reflection', '[1 − R]')} {term('absorption', <>[1 − e<sup>−α(λ)d</sup>]</>)} {term('wavelengthSum', 'dλ')}
            </div>
            <div className="formula-line">{term('Iph', <>I<sub>ph</sub></>)} = {term('Iideal', <>I<sub>ph,ideal</sub></>)} × {term('eta', <>η<sub>c</sub></>)} × {term('shade', <>(1 − f<sub>metal</sub>)</>)}</div>
          </>
        )}
        <div className="term-explanation" aria-live="polite"><h3>{definitions[selectedTerm].name}</h3><p>{definitions[selectedTerm].text}</p>
          {definitions[selectedTerm].detail && <details key={selectedTerm}><summary>More detail</summary><p>{definitions[selectedTerm].detail}</p></details>}
        </div>
        {!results.assembled && <p>Finish adding the four layers first. Until then, these numbers describe the design you are setting up, not a working cell.</p>}
        <details className="model-assumptions"><summary>Parameters, calibration & sources</summary>
          <p>We keep temperature, charge collection and a few electrical properties fixed so you can focus on your design. This is a simplified 1 m² cell for learning—not a prediction of a real panel’s output.</p>
          <p><a href="https://www.nlr.gov/grid/solar-resource/spectra-am1.5" target="_blank" rel="noreferrer">ASTM G173 AM1.5 spectrum</a> · <a href="https://doi.org/10.1016/j.solmat.2008.06.009" target="_blank" rel="noreferrer">Silicon absorption data</a> · <a href="https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/single-diode-equivalent-circuit-models/" target="_blank" rel="noreferrer">Single-diode model</a></p>
        </details>
      </div>
    </dialog>
  )
}
