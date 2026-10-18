import { useState } from 'react'
import type { ElectricalResults, OperatingMode } from '../physics/electrical'
import { device, saturationCurrent, thermalVoltage } from '../physics/electrical'
import type { PartSettings } from '../partOptions'
import circuitImage from '../assets/diodesolar.webp'

type CircuitViewProps = {
  results: ElectricalResults
  settings: PartSettings
  mode: OperatingMode
}

type ComponentId = 'light' | 'diode' | 'shunt' | 'series' | 'junction' | 'output'

export default function CircuitView({ results, settings, mode }: CircuitViewProps) {
  const [selected, setSelected] = useState<ComponentId>('light')
  const point = mode === 'mpp' ? results.mpp : results.load
  const junctionVoltage = point.voltage + point.current * results.seriesResistance
  const diodeLoss = saturationCurrent * Math.expm1(junctionVoltage / (device.idealityFactor * thermalVoltage))
  const components = {
    light: {
      name: 'Light-generated current · IL',
      explanation: 'Start here: absorbed light frees charges in the silicon. We represent that supply of charge with a current source, the circle with an arrow. It is not a separate battery hidden inside the cell. IL is the same light-generated current we call Iph elsewhere. That supply then splits between the three paths in this diagram.',
      formula: 'IL = Iph',
      value: results.photocurrent.toFixed(3) + ' A',
      box: { left: '1%', top: '42%', width: '14%', height: '31%' },
    },
    diode: {
      name: 'The silicon junction · diode',
      explanation: 'A solar cell is also a diode because it contains a p–n junction. Even while light supplies charge, some current flows internally through that junction instead of out to your device. That is why the diode sits across the same two wires as the light source. As the internal voltage rises, this current rises rapidly, so we subtract it from the light-generated current.',
      formula: 'ID = I0 [exp(qVj / nkT) − 1]',
      value: diodeLoss.toFixed(3) + ' A',
      box: { left: '22%', top: '47%', width: '7%', height: '18%' },
    },
    shunt: {
      name: 'An unwanted shortcut · RSH',
      explanation: 'A real cell is not perfectly insulating everywhere. Some charge can take a leakage path between its two sides instead of going through your device. RSH represents that shortcut, so it is drawn as another parallel branch. A larger resistance makes that path harder to use and reduces the wasted current. We subtract this current too.',
      formula: 'ISH = Vj / RSH',
      value: (junctionVoltage / device.shuntResistance).toExponential(2) + ' A',
      box: { left: '45%', top: '38%', width: '8%', height: '38%' },
    },
    series: {
      name: 'Resistance on the way out · RS',
      explanation: 'The useful current still has to travel through silicon and metal contacts. Those paths are not perfect conductors: they use up some voltage and release energy as heat. We put RS in series because the output current must pass through it. This is where your finger-width changes matter electrically. RS stands for the combined resistance, not one extra physical resistor.',
      formula: 'Vout = Vj − Iout RS',
      value: results.seriesResistance.toExponential(2) + ' Ω',
      box: { left: '65%', top: '7%', width: '19%', height: '19%' },
    },
    junction: {
      name: 'The voltage inside the cell · Vj',
      explanation: 'The light source, diode and leakage branch all connect to the same top and bottom wires, so they all share the same internal voltage, Vj. The voltage you can use outside is a little smaller because current loses some voltage while passing through RS. That is why the diode and leakage equations use Vj rather than just the output voltage.',
      formula: 'Vj = Vout + Iout RS',
      value: junctionVoltage.toFixed(4) + ' V',
      box: { left: '56%', top: '27%', width: '8%', height: '60%' },
    },
    output: {
      name: 'What reaches your device · Iout and Vout',
      explanation: 'The two circles on the right are the cell’s terminals. Connect a device between them and the remaining current can travel through it and return along the bottom wire. Read the current equation as a simple balance: what light supplies, minus what the two internal branches take, is what your device receives.',
      formula: mode === 'load' ? 'Vout = Iout Rload; P = Vout Iout' : 'P = Vout Iout; choose the point with the largest P',
      value: point.current.toFixed(3) + ' A · ' + point.voltage.toFixed(4) + ' V',
      box: { left: '85%', top: '0%', width: '15%', height: '100%' },
    },
  }
  const active = components[selected]

  function select(id: ComponentId) {
    setSelected(id)
  }

  return (
    <figure className="circuit-view">
      <p>This is a model of how the cell behaves electrically—not a list of extra parts to install. Hover, click, or use Tab to explore each component.</p>
      <div className="circuit-image">
        <img src={circuitImage} width="1920" height="942" alt="Solar cell equivalent circuit: light current source IL, diode and shunt resistance RSH in parallel, followed by series resistance RS and output terminals." />
        {(Object.keys(components) as ComponentId[]).map((id) => (
          <button type="button" key={id} className="circuit-hotspot" style={components[id].box}
            aria-label={components[id].name} aria-pressed={selected === id} aria-controls="circuit-explanation"
            onMouseEnter={() => select(id)} onFocus={() => select(id)} onClick={() => select(id)} />
        ))}
      </div>
      <div className="circuit-choices" role="group" aria-label="Circuit components">
        {(Object.keys(components) as ComponentId[]).map((id) => (
          <button type="button" key={id} aria-pressed={selected === id}
            onMouseEnter={() => select(id)} onFocus={() => select(id)} onClick={() => select(id)}>{components[id].name}</button>
        ))}
      </div>
      <figcaption>
        <section className="circuit-explanation" id="circuit-explanation" aria-live="polite">
          <h3>{active.name}</h3>
          <p>{active.explanation}</p>
          <p className="circuit-component-formula">{active.formula}</p>
          <p>{results.assembled ? active.value : 'Assemble the cell first to see a live reading.'}</p>
        </section>
        <p>{mode === 'load' ? `Your external load is ${settings.loadResistance} Ω. Change it in Parts to move the operating point.` : 'Maximum-power mode uses an ideal controller at the terminals. Choose Resistor load to connect your adjustable resistor instead.'}</p>
        {!results.assembled && <p>Add all four layers to turn on electrical output.</p>}
        <div className="circuit-current-formula">
          <h3>The current balance</h3>
          <p>Light supplies current. The diode and leakage paths take some away. The rest reaches the output.</p>
          <div className="formula-line" aria-label="Output current equals light current minus diode current minus shunt current">
            <span className={selected === 'output' ? 'circuit-selected-term' : ''}>Iout</span> = <span className={selected === 'light' ? 'circuit-selected-term' : ''}>IL</span> − <span className={selected === 'diode' ? 'circuit-selected-term' : ''}>I0 [exp(qVj / nkT) − 1]</span> − <span className={selected === 'shunt' ? 'circuit-selected-term' : ''}>Vj / RSH</span>
          </div>
          <div className="formula-line"><span className={selected === 'junction' || selected === 'series' ? 'circuit-selected-term' : ''}>Vj = Vout + Iout RS</span></div>
          <p>Iout and Vout are the same I and V used in the power formula. The diode term describes ID, and the last term describes ISH.</p>
        </div>
      </figcaption>
    </figure>
  )
}
