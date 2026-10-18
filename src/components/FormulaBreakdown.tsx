import { useState } from 'react'
import type { ReactNode } from 'react'
import type { OperatingMode } from '../physics/electrical'

const symbols: Record<string, { label: ReactNode; name: string; explanation: string }> = {
  P: { label: 'P', name: 'Power', explanation: 'Electrical energy delivered each second, measured in watts.' },
  V: { label: 'V', name: 'Output voltage', explanation: 'Energy available per unit of charge at the cell’s terminals, measured in volts.' },
  I: { label: 'I', name: 'Output current', explanation: 'Charge flowing through the external circuit each second, measured in amperes.' },
  I0: { label: <>I<sub>0</sub></>, name: 'Diode saturation current', explanation: 'A small reference current that sets the scale of the diode’s response.' },
  q: { label: 'q', name: 'Elementary charge', explanation: 'The magnitude of one electron’s charge: about 1.602 × 10⁻¹⁹ coulombs.' },
  Rs: { label: <>R<sub>s</sub></>, name: 'Series resistance', explanation: 'The combined resistance along the current’s path through silicon and contacts, in ohms.' },
  Rsh: { label: <>R<sub>sh</sub></>, name: 'Shunt resistance', explanation: 'Resistance of the unwanted leakage path across the cell, in ohms.' },
  n: { label: 'n', name: 'Diode ideality factor', explanation: 'Adjusts how quickly diode current rises with voltage. Here it is fixed at 1.2.' },
  k: { label: 'k', name: 'Boltzmann constant', explanation: 'Converts temperature into an energy scale. Together, kT describes thermal energy.' },
  T: { label: 'T', name: 'Temperature', explanation: 'The cell temperature in kelvin, fixed here at 300 K.' },
  A: { label: 'A', name: 'Cell area', explanation: 'The illuminated footprint, fixed at 1 m². Metal shading is accounted for separately.' },
  Phi: { label: 'Φ', name: 'Photon spectrum', explanation: 'How many photons arrive each second, per square metre and per wavelength interval.' },
  lambda: { label: 'λ', name: 'Wavelength', explanation: 'The wavelength of the light being counted. Longer wavelengths have less energy per photon.' },
  R: { label: 'R', name: 'Reflected fraction', explanation: 'The share of incoming light that bounces away: for example, 5% means R = 0.05.' },
  alpha: { label: 'α', name: 'Absorption coefficient', explanation: 'How strongly silicon absorbs this wavelength. A larger value means light is absorbed over a shorter distance.' },
  d: { label: 'd', name: 'Silicon thickness', explanation: 'How far light travels through the silicon. Its units must match the absorption coefficient.' },
  h: { label: 'h', name: 'Planck constant', explanation: 'A constant connecting a photon’s frequency to its energy.' },
  c: { label: 'c', name: 'Speed of light', explanation: 'The speed of light in vacuum. Combined with h and wavelength, it gives photon energy.' },
  Eg: { label: <>E<sub>g</sub></>, name: 'Bandgap energy', explanation: 'The minimum energy needed to generate an electron–hole pair: 1.12 eV in this model.' },
  exp: { label: 'exp', name: 'Exponential function', explanation: 'exp(x) means e raised to x. This describes the rapid rise of diode current.' },
  e: { label: 'e', name: 'Exponential base', explanation: 'The number e is about 2.718. Here its negative exponent describes how much light gets through silicon.' },
  eta: { label: <>η<sub>c</sub></>, name: 'Collection efficiency', explanation: 'The fraction of generated charge collected at the contacts, fixed at 0.95 here.' },
  metal: { label: <>f<sub>metal</sub></>, name: 'Metal-covered fraction', explanation: 'The fraction of the surface shaded by fingers and busbars. Their overlaps count only once.' },
  load: { label: <>R<sub>load</sub></>, name: 'Load resistance', explanation: 'The resistance of the external device connected to the cell, measured in ohms.' },
  Vmp: { label: <>V<sub>mp</sub></>, name: 'Maximum-power voltage', explanation: 'The output voltage at the point where voltage times current is largest.' },
  integral: { label: '∫', name: 'Integral', explanation: 'Adds the small contributions from different wavelengths, from zero to the bandgap wavelength cutoff.' },
}

export default function FormulaBreakdown({ group, mode, onClose }: { group: string; mode: OperatingMode; onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  function symbol(id: string) {
    const entry = symbols[id]
    return <button type="button" className="formula-symbol" aria-label={entry.name} title={entry.explanation}
      aria-describedby="symbol-explanation" onMouseEnter={() => setSelected(id)} onFocus={() => setSelected(id)} onClick={() => setSelected(id)}>{entry.label}</button>
  }
  const junction = <>{symbol('V')} + {symbol('I')} {symbol('Rs')}</>
  const expressions: Record<string, ReactNode> = {
    power: <>{symbol('P')} = {symbol('V')} × {symbol('I')}</>,
    voltage: mode === 'load' ? <>{symbol('V')} = {symbol('I')} × {symbol('load')}</> : <>{symbol('Vmp')}: maximise {symbol('V')} × {symbol('I')}</>,
    diodeLoss: <>{symbol('I0')} [{symbol('exp')}(<span className="formula-fraction"><span>{symbol('q')}({junction})</span><span>{symbol('n')}{symbol('k')}{symbol('T')}</span></span>) − 1]</>,
    leakage: <span className="formula-fraction"><span>{junction}</span><span>{symbol('Rsh')}</span></span>,
    chargeArea: <>{symbol('q')}{symbol('A')}</>,
    Phi: <>{symbol('Phi')}({symbol('lambda')})</>,
    reflection: <>[1 − {symbol('R')}]</>,
    absorption: <>[1 − {symbol('e')}<sup>−{symbol('alpha')}({symbol('lambda')}){symbol('d')}</sup>]</>,
    cutoff: <span className="formula-fraction"><span>{symbol('h')}{symbol('c')}</span><span>{symbol('Eg')}</span></span>,
    wavelengthSum: <>d{symbol('lambda')}</>,
    eta: symbol('eta'),
    shade: <>(1 − {symbol('metal')})</>,
    integral: <span className="formula-integral"><sup><span className="formula-fraction"><span>{symbol('h')}{symbol('c')}</span><span>{symbol('Eg')}</span></span></sup>{symbol('integral')}<sub>0</sub></span>,
  }
  return (
    <section className="formula-breakdown" aria-label="Individual symbols in the selected group">
      <div className="breakdown-header"><h3>Inside this group</h3><button type="button" onClick={onClose}>Back to group</button></div>
      <p>Hover a symbol, focus it with Tab, or tap to see its meaning.</p>
      <div className="formula-line">{expressions[group]}</div>
      <div id="symbol-explanation" className="symbol-explanation" aria-live="polite">
        {selected ? <><h4>{symbols[selected].name}</h4><p>{symbols[selected].explanation}</p></> : <p>Select a symbol above.</p>}
      </div>
      {group === 'wavelengthSum' && <p>Here dλ means a small wavelength interval. This d is not the silicon thickness used in the absorption term.</p>}
    </section>
  )
}
