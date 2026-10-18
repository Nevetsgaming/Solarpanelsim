import type { ElectricalResults, OperatingMode } from '../physics/electrical'
import { diodeCurrent } from '../physics/electrical'

export default function IVCurve({ results, mode }: { results: ElectricalResults; mode: OperatingMode }) {
  const operating = results[mode]
  const maxVoltage = results.openCircuitVoltage
  const maxCurrent = results.photocurrent
  const x = (voltage: number) => 48 + voltage / maxVoltage * 254
  const y = (current: number) => 168 - current / maxCurrent * 130
  const points: string[] = []
  if (results.assembled && maxVoltage > 0 && maxCurrent > 0) {
    for (let index = 0; index <= 160; index++) {
      const junction = maxVoltage * index / 160
      const current = Math.max(0, diodeCurrent(junction, maxCurrent))
      const voltage = junction - current * results.seriesResistance
      if (voltage >= 0) points.push(`${x(voltage)},${y(current)}`)
    }
  }
  return (
    <details className="iv-curve">
      <summary>Why do current and voltage change together?</summary>
      <p>The curve shows the combinations your cell can supply. The dot marks the selected operating point.</p>
      {points.length ? <svg viewBox="0 0 330 215" role="img" aria-label="Current–voltage curve with the selected operating point and maximum-power point">
        <path d="M48 30V168H310" fill="none" stroke="currentColor" />
        <polyline points={points.join(' ')} fill="none" stroke="#2468c9" strokeWidth="2" />
        <circle cx={x(results.mpp.voltage)} cy={y(results.mpp.current)} r="6" fill="#fff" stroke="#1d7b53" strokeWidth="2" />
        <circle cx={x(operating.voltage)} cy={y(operating.current)} r="4" fill="#2468c9" />
        <g fill="currentColor" fontSize="11"><text x="48" y="185">0</text><text x="235" y="185">{maxVoltage.toFixed(2)} V</text><text x="58" y="20">Current (A)</text><text x="215" y="205">Voltage (V)</text><text x="3" y="42">{maxCurrent.toFixed(0)}</text></g>
      </svg> : <p>{results.assembled ? 'There is no light-generated current to plot. Check shading, reflection and wavelength.' : 'Finish the assembly to see your curve.'}</p>}
      <p>Blue dot: selected point. Green ring: maximum power. Voltage × current is the power at either point.</p>
    </details>
  )
}
