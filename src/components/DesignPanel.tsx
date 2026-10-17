import Panel from './Panel'

const plannedControls = [
  { name: 'Wavelength', unit: 'nm', description: 'Energy of the incoming photons' },
  { name: 'Absorber thickness', unit: 'µm', description: 'Distance light travels through silicon' },
  { name: 'Finger width', unit: 'µm', description: 'Width of the front metal contacts' },
  { name: 'Finger spacing', unit: 'mm', description: 'Distance between finger centres' },
]

export default function DesignPanel() {
  return (
    <Panel id="design" step="01" title="Design" description="Set up your solar cell.">
      <h3 className="section-label">Material</h3>
      <div className="material-card">
        <span className="material-symbol" aria-hidden="true">Si</span>
        <div><h3>Silicon</h3><p>Fixed material for this experiment</p></div>
      </div>

      <div className="section-heading">
        <h3 className="section-label">Design controls</h3>
        <span className="small-note">Coming next</span>
      </div>
      <ul className="control-list">
        {plannedControls.map((control) => (
          <li key={control.name}>
            <div className="control-title"><h4>{control.name}</h4><span>{control.unit}</span></div>
            <p>{control.description}</p>
          </li>
        ))}
      </ul>
      <p className="panel-note">We’ll add one control at a time, starting with wavelength.</p>
    </Panel>
  )
}
