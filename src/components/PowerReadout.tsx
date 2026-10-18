import type { ElectricalResults } from '../physics/electrical'
export type ReadingTopic = 'power' | 'current' | 'voltage'

type PowerReadoutProps = {
  results: ElectricalResults
  onExplore: (topic: ReadingTopic) => void
  challengeActive?: boolean
}

export default function PowerReadout({ results, onExplore, challengeActive = false }: PowerReadoutProps) {
  const operating = results.mpp
  function reading(value: number) {
    if (!results.assembled) return '—'
    if (value > 0 && value < 0.01) return value.toExponential(2)
    return value.toFixed(value < 1 ? 3 : 2)
  }

  return (
    <div className="power-box">
      {challengeActive && <p className="small-note">Challenge: only finger width can change.</p>}
      <h3 title="An ideal controller automatically selects the current and voltage that give the most power.">Maximum power (P<sub>max</sub>)</h3>
      <button type="button" className="power-value power-button" onClick={() => onExplore('power')} aria-haspopup="dialog" aria-label={`Explore power calculation: ${reading(operating.power)} watts`}>
        {reading(operating.power)} <span>W</span>
      </button>
      <div className="electrical-readings">
        <div><h3>Current (I<sub>mp</sub>)</h3><button type="button" className="reading-button power-button" onClick={() => onExplore('current')} aria-haspopup="dialog" aria-label={`Explore current calculation: ${reading(operating.current)} amperes`}>{reading(operating.current)} A</button></div>
        <div><h3>Voltage (V<sub>mp</sub>)</h3><button type="button" className="reading-button power-button" onClick={() => onExplore('voltage')} aria-haspopup="dialog" aria-label={`Explore voltage calculation: ${reading(operating.voltage)} volts`}>{reading(operating.voltage)} V</button></div>
      </div>
      <p className="power-help">{results.assembled ? 'Click a reading to learn more.' : 'Add all four layers to start.'}</p>
    </div>
  )
}
