import { useId, useRef } from 'react'
import { siliconBandgapEv, bandgapWavelengthNm } from '../physics/optics'

export default function BandgapInfo() {
  const dialog = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  return (
    <div className="bandgap-info">
      <button type="button" className="bandgap-button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        <span>Electron bandgap</span><strong>{siliconBandgapEv} eV</strong>
      </button>
      <dialog ref={dialog} className="formula-dialog bandgap-dialog" aria-labelledby={headingId}
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close() }}>
        <div className="formula-dialog-content">
          <header className="formula-dialog-header">
            <h2 id={headingId}>What is the bandgap?</h2>
            <button type="button" className="formula-close" aria-label="Close bandgap explanation" onClick={() => dialog.current?.close()}>×</button>
          </header>
          <p>The bandgap is the energy an electron needs to move from a bound state into a band where it can carry current. An absorbed photon with enough energy can make that jump, leaving a hole behind.</p>
          <div className="bandgap-levels" aria-label={`Energy gap between the valence and conduction bands: ${siliconBandgapEv} electron volts`}>
            <div>Conduction band · mobile electrons</div>
            <span>↑ E<sub>g</sub> = {siliconBandgapEv} eV</span>
            <div>Valence band · bound electrons</div>
          </div>
          <p>For silicon in this model, the gap is fixed at {siliconBandgapEv} eV. That gives a longest usable wavelength of about {Math.round(bandgapWavelengthNm)} nm. Enough energy makes generation possible—it does not guarantee absorption.</p>
        </div>
      </dialog>
    </div>
  )
}
