import type { DesignSnapshot } from '../experiments'
import { explainChange, formatWidth, powerDifference } from '../experiments'

type ExperimentPanelProps = {
  current: DesignSnapshot
  previous: DesignSnapshot | null
  saved: DesignSnapshot | null
  challengeBaseline: number | null
  onSave: () => void
  onRestore: () => void
  onChallenge: () => void
  onEndChallenge: () => void
}

export default function ExperimentPanel({ current, previous, saved, challengeBaseline, onSave, onRestore, onChallenge, onEndChallenge }: ExperimentPanelProps) {
  const power = current.results[current.mode].power
  const challengeActive = challengeBaseline !== null
  function settingsSummary(design: DesignSnapshot) {
    return `${design.isSunlight ? 'Sunlight' : `${design.settings.wavelengthNm} nm`} · ${design.mode === 'mpp' ? 'Maximum power' : `${design.settings.loadResistance} Ω load`} · fingers ${formatWidth(design.settings.fingerWidth)}, ${design.settings.fingerSpacing} mm apart · silicon ${design.settings.siliconThickness} µm · reflected ${design.settings.reflectedPercent}%`
  }
  return (
    <section className="experiment-panel" aria-labelledby="experiment-title">
      <h3 id="experiment-title">Try an experiment</h3>
      <p>Can you beat the starting power by changing only finger width?</p>
      {challengeActive ? <>
        <p>Sunlight, maximum-power mode and all other settings are fixed. Starting power: {challengeBaseline.toFixed(2)} W.</p>
        <p role="status">{power > challengeBaseline + 1e-6 ? 'You beat the starting design! ' : 'Keep experimenting. '}{powerDifference(challengeBaseline, power)}</p>
        <button type="button" onClick={onEndChallenge}>End challenge</button>
      </> : <><p>Starting the challenge resets the settings and assembles the cell for you.</p><button type="button" onClick={onChallenge}>Start finger-width challenge</button></>}
      {previous && <div className="experiment-feedback"><h4>Your last change</h4><p role="status">{explainChange(previous, current)}</p></div>}
      <div className="experiment-actions">
        <button type="button" disabled={!current.results.assembled || challengeActive} onClick={onSave}>{saved ? 'Replace saved design' : 'Save this design'}</button>
        {saved && <button type="button" disabled={challengeActive} onClick={onRestore}>Restore saved design</button>}
      </div>
      {saved && <details className="saved-design"><summary>Saved design · {saved.results[saved.mode].power.toFixed(2)} W</summary>
        <p>{settingsSummary(saved)}</p>
        <p>Rear thickness: {saved.settings.rearThickness} µm; coating: {saved.settings.coatingThickness} nm (appearance only).</p>
        <p>{explainChange(saved, current)}</p>
      </details>}
      <p className="small-note">One saved design, kept until you refresh this page.</p>
    </section>
  )
}
