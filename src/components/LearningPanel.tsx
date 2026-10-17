import Panel from './Panel'

export default function LearningPanel() {
  return (
    <Panel id="learning" step="03" title="Understand" description="Connect your design to the physics.">
      <div className="learning-intro">
        <span className="section-label">Your experiment</span>
        <h3>One change.<br />What happens next?</h3>
        <p>Adjust a design choice, observe the cell, and explore how its electrical output responds.</p>
      </div>
      <h3 className="section-label">Explore in three steps</h3>
      <ol className="learning-steps">
        <li><h4>Start with light</h4><p>How does wavelength affect a photon’s energy?</p></li>
        <li><h4>Explore absorption</h4><p>What changes when the silicon gets thicker?</p></li>
        <li><h4>Balance the contacts</h4><p>How can metal help collection while blocking light?</p></li>
      </ol>
      <p className="panel-note">As controls are added, this panel will explain your selection with formulas and insights.</p>
    </Panel>
  )
}
