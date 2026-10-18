import { useState } from 'react'
import type { ElectricalResults } from '../physics/electrical'
import { device, saturationCurrent, thermalVoltage } from '../physics/electrical'
import circuitImage from '../assets/diodesolar.webp'

type CircuitViewProps = {
  results: ElectricalResults
}

type ComponentId = 'light' | 'diode' | 'shunt' | 'series' | 'junction' | 'output'

const outputCurrent = <>I<sub>out</sub></>
const outputVoltage = <>V<sub>out</sub></>
const lightCurrent = <>I<sub>ph</sub></>
const junction = <>V<sub>j</sub></>
const seriesResistance = <>R<sub>S</sub></>
const shuntResistance = <>R<sub>SH</sub></>
const diodeExpression = <>I<sub>0</sub> [e<sup><span className="formula-fraction"><span>q{junction}</span><span>nkT</span></span></sup> − 1]</>
const leakageExpression = <span className="formula-fraction"><span>{junction}</span><span>{shuntResistance}</span></span>
const junctionEquation = <>{junction} = {outputVoltage} + {outputCurrent} {seriesResistance}</>

export default function CircuitView({ results }: CircuitViewProps) {
  const [selected, setSelected] = useState<ComponentId>('light')
  const point = results.mpp
  const junctionVoltage = point.voltage + point.current * results.seriesResistance
  const diodeLoss = saturationCurrent * Math.expm1(junctionVoltage / (device.idealityFactor * thermalVoltage))
  const components = {
    light: {
      name: 'Light-generated current · Iph',
      label: <>Light-generated current · {lightCurrent}</>,
      explanation: 'The circle represents charge supplied by absorbed light, not a separate battery. This current splits between the internal branches and your device.',
      formula: <>{lightCurrent} = I<sub>L</sub> (in the image)</>,
      value: results.photocurrent.toFixed(3) + ' A',
      box: { left: '1%', top: '42%', width: '14%', height: '31%' },
    },
    diode: {
      name: 'The silicon junction · diode',
      label: <>The silicon junction · diode</>,
      explanation: 'The cell’s p–n junction also behaves as a diode. Its internal current rises rapidly with voltage, leaving less current for your device. That is why we subtract this branch.',
      formula: <>I<sub>D</sub> = {diodeExpression}</>,
      value: diodeLoss.toFixed(3) + ' A',
      box: { left: '22%', top: '47%', width: '7%', height: '18%' },
    },
    shunt: {
      name: 'An unwanted shortcut · RSH',
      label: <>An unwanted shortcut · {shuntResistance}</>,
      explanation: 'Some current leaks between the cell’s two sides instead of reaching your device. This parallel resistor represents that shortcut. Higher resistance means less leakage.',
      formula: <>I<sub>SH</sub> = {leakageExpression}</>,
      value: (junctionVoltage / device.shuntResistance).toExponential(2) + ' A',
      box: { left: '45%', top: '38%', width: '8%', height: '38%' },
    },
    series: {
      name: 'Resistance on the way out · RS',
      label: <>Resistance on the way out · {seriesResistance}</>,
      explanation: 'Output current must travel through silicon and metal, losing some voltage along the way. This series resistor represents those combined losses. Wider fingers reduce their share of this resistance.',
      formula: <>{outputVoltage} = {junction} − {outputCurrent} {seriesResistance}</>,
      value: results.seriesResistance.toExponential(2) + ' Ω',
      box: { left: '65%', top: '7%', width: '19%', height: '19%' },
    },
    junction: {
      name: 'The voltage inside the cell · Vj',
      label: <>The voltage inside the cell · {junction}</>,
      explanation: 'All three parallel branches share the same internal voltage. It is higher than the output voltage by the amount lost across the series resistance.',
      formula: junctionEquation,
      value: junctionVoltage.toFixed(4) + ' V',
      box: { left: '56%', top: '27%', width: '8%', height: '60%' },
    },
    output: {
      name: 'What reaches your device · Iout and Vout',
      label: <>What reaches your device · {outputCurrent} and {outputVoltage}</>,
      explanation: 'Connect your device between the two terminals on the right. It receives the light-generated current minus the diode and leakage currents. Output voltage times output current gives its power.',
      formula: <>P = {outputVoltage} {outputCurrent}</>,
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
      <p>The image calls light-generated current I<sub>L</sub>. We use I<sub>ph</sub> throughout the simulator—they mean the same thing. Hover or select a component to explore.</p>
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
            onMouseEnter={() => select(id)} onFocus={() => select(id)} onClick={() => select(id)}>{components[id].label}</button>
        ))}
      </div>
      <figcaption>
        <section className="circuit-explanation" id="circuit-explanation" aria-live="polite">
          <h3>{active.label}</h3>
          <p>{active.explanation}</p>
          <p className="circuit-component-formula">{active.formula}</p>
          <p>{results.assembled ? active.value : 'Assemble the cell first to see a live reading.'}</p>
        </section>
        <p>An ideal controller automatically chooses the current and voltage that deliver the most power.</p>
        {!results.assembled && <p>Add all four layers to turn on electrical output.</p>}
        <div className="circuit-current-formula">
          <h3>The current balance</h3>
          <p>Light supplies current. The diode and leakage paths take some away. The rest reaches the output.</p>
          <div className="formula-line" aria-label="Output current equals light current minus diode current minus shunt current">
            <span className={selected === 'output' ? 'circuit-selected-term' : ''}>{outputCurrent}</span> = <span className={selected === 'light' ? 'circuit-selected-term' : ''}>{lightCurrent}</span> − <span className={selected === 'diode' ? 'circuit-selected-term' : ''}>{diodeExpression}</span> − <span className={selected === 'shunt' ? 'circuit-selected-term' : ''}>{leakageExpression}</span>
          </div>
          <div className="formula-line"><span className={selected === 'junction' || selected === 'series' ? 'circuit-selected-term' : ''}>{junctionEquation}</span></div>
          <p>{outputCurrent} and {outputVoltage} are the same I and V used in the power formula. The two subtracted terms are the diode current I<sub>D</sub> and leakage current I<sub>SH</sub>.</p>
        </div>
      </figcaption>
    </figure>
  )
}
