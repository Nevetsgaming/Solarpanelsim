import type { ElectricalResults, OperatingMode } from '../physics/electrical'
export type ReadingTopic = 'power' | 'current' | 'voltage'

type PowerReadoutProps = {
  results: ElectricalResults
  mode: OperatingMode
  onModeChange: (mode: OperatingMode) => void
  onExplore: (topic: ReadingTopic) => void
}

export default function PowerReadout({ results, mode, onModeChange, onExplore }: PowerReadoutProps) {
  const operating = mode === 'mpp' ? results.mpp : results.load
  function reading(value: number) {
    if (!results.assembled) return '—'
    if (value > 0 && value < 0.01) return value.toExponential(2)
    return value.toFixed(value < 1 ? 3 : 2)
  }

  return (
    <div className="power-box">
      <div className="electrical-mode" role="group" aria-label="Electrical operating mode">
        <button type="button" aria-pressed={mode === 'mpp'} onClick={() => onModeChange('mpp')}>Maximum power</button>
        <button type="button" aria-pressed={mode === 'load'} onClick={() => onModeChange('load')}>Resistor load</button>
      </div>
      <h3>{mode === 'mpp' ? 'Maximum power (Pmax)' : 'Power delivered to load'}</h3>
      <button type="button" className="power-value power-button" onClick={() => onExplore('power')} aria-haspopup="dialog" aria-label={`Explore power calculation: ${reading(operating.power)} watts`}>
        {reading(operating.power)} <span>W</span>
      </button>
      <div className="electrical-readings">
        <div><h3>{mode === 'mpp' ? 'Current (Imp)' : 'Load current'}</h3><button type="button" className="reading-button power-button" onClick={() => onExplore('current')} aria-haspopup="dialog" aria-label={`Explore current calculation: ${reading(operating.current)} amperes`}>{reading(operating.current)} A</button></div>
        <div><h3>{mode === 'mpp' ? 'Voltage (Vmp)' : 'Load voltage'}</h3><button type="button" className="reading-button power-button" onClick={() => onExplore('voltage')} aria-haspopup="dialog" aria-label={`Explore voltage calculation: ${reading(operating.voltage)} volts`}>{reading(operating.voltage)} V</button></div>
      </div>
      <p className="power-help">{results.assembled ? 'Click any reading and we’ll walk through where it comes from.' : 'Add all four layers first, then we can see how much electricity your cell produces.'}</p>
    </div>
  )
}
