import type { ElectricalResults, OperatingMode } from '../physics/electrical'
import { device } from '../physics/electrical'
import type { PartSettings } from '../partOptions'

type CircuitViewProps = {
  results: ElectricalResults
  settings: PartSettings
  mode: OperatingMode
}

export default function CircuitView({ results, settings, mode }: CircuitViewProps) {
  return (
    <figure className="circuit-view">
      <svg viewBox="0 0 640 330" role="img" aria-label="Solar cell equivalent circuit: light current source, diode and shunt resistance in parallel, followed by series resistance and an external load">
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Three parallel branches share the internal top and bottom rails. */}
          <path d="M90 125V70H375 M90 205V260H565V205 M220 70V135 M220 175V260 M350 70V135 M350 195V260 M465 70H565V135" />
          <circle cx="90" cy="165" r="40" />
          <path d="M90 190V140 M80 152L90 140L100 152" />
          <path d="M200 135H240L220 175Z M200 175H240" />
          <rect x="337" y="135" width="26" height="60" />
          <path d="M375 70H385L395 58L407 82L419 58L431 82L443 58L453 70H465" />
          <rect x="544" y="135" width="42" height="70" rx="2" />
          <path d="M480 70H520 M510 62L520 70L510 78" />
          <circle cx="520" cy="70" r="3" fill="currentColor" />
          <circle cx="520" cy="260" r="3" fill="currentColor" />
          <circle cx="220" cy="70" r="3" fill="currentColor" />
          <circle cx="220" cy="260" r="3" fill="currentColor" />
          <circle cx="350" cy="70" r="3" fill="currentColor" />
          <circle cx="350" cy="260" r="3" fill="currentColor" />
        </g>
        <g fill="currentColor" fontSize="16" textAnchor="middle">
          <text x="90" y="110">Iph</text>
          <text x="220" y="115">Diode</text>
          <text x="350" y="115">Rsh</text>
          <text x="419" y="40">Rs</text>
          <text x="500" y="50">I →</text>
          <text x="610" y="105">+</text><text x="610" y="175">V</text><text x="610" y="248">−</text>
          <text x="565" y="125">{mode === 'load' ? 'Rload' : 'MPPT'}</text>
          <text x="320" y="305">Solar cell model → external circuit</text>
        </g>
      </svg>
      <figcaption>
        <p>Light supplies current on the left. Some takes the diode or leakage path instead of reaching your device. The rest passes through the cell’s series resistance and into the external circuit.</p>
        <dl>
          <div><dt>Light-generated current (Iph)</dt><dd>{results.assembled ? `${results.photocurrent.toFixed(2)} A` : 'Assemble the cell first'}</dd></div>
          <div><dt>Series resistance (Rs)</dt><dd>{results.seriesResistance.toExponential(2)} Ω</dd></div>
          <div><dt>Leakage resistance (Rsh)</dt><dd>{device.shuntResistance} Ω</dd></div>
          <div><dt>External circuit</dt><dd>{mode === 'load' ? `${settings.loadResistance} Ω load` : 'Ideal maximum-power controller'}</dd></div>
        </dl>
        <p>{mode === 'load' ? 'Change the load resistance in Parts to see the readings update.' : 'In Maximum power mode, an ideal controller chooses the best operating point. Choose Resistor load to use your adjustable resistor instead.'}</p>
        {!results.assembled && <p>This diagram explains the model. Add all four layers to turn on electrical output.</p>}
      </figcaption>
    </figure>
  )
}
