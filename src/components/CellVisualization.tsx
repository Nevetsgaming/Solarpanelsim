import Panel from './Panel'

export default function CellVisualization() {
  return (
    <Panel id="visualization" step="02" title="Observe" description="Look inside your solar cell.">
      <div className="view-heading">
        <h3 className="section-label">Cross-section</h3>
        <span className="small-note">Schematic · not to scale</span>
      </div>
      <div className="cell-stage" role="img" aria-label="Static solar cell cross-section showing incoming light, front contacts, coating, silicon with a junction near the front, and rear contact. Not to scale.">
        <div className="incident-label">Incoming light</div>
        <div className="light-rays" aria-hidden="true"><span>↓</span><span>↓</span><span>↓</span><span>↓</span><span>↓</span></div>
        <div className="cell-schematic" aria-hidden="true">
          <div className="front-contacts"><span /><span /><span /></div>
          <div className="coating" />
          <div className="silicon"><div className="junction" /><span>Silicon absorber</span></div>
          <div className="rear-contact" />
        </div>
      </div>
      <ul className="layer-legend" aria-label="Cell layers">
        <li><span className="swatch metal-swatch" />Front contacts</li>
        <li><span className="swatch coating-swatch" />Coating</li>
        <li><span className="swatch junction-swatch" />Junction region</li>
        <li><span className="swatch rear-swatch" />Rear contact</li>
      </ul>
      <p className="panel-note">A first look at the cell’s layers. Animation and a top view will follow as we build the model.</p>
    </Panel>
  )
}
