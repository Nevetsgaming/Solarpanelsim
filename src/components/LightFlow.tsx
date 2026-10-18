import type { PartSettings } from '../partOptions'
import { lightBudget } from '../physics/lightBudget'

export default function LightFlow({ settings, isSunlight, placedPartCount, unshadedFraction }: {
  settings: PartSettings; isSunlight: boolean; placedPartCount: number; unshadedFraction: number
}) {
  const budget = lightBudget(settings.wavelengthNm, settings.siliconThickness, placedPartCount >= 3 ? settings.reflectedPercent : 0, placedPartCount >= 4 ? unshadedFraction : 1, isSunlight, placedPartCount >= 2)
  const blocked = budget.blocked * 100
  const reflected = budget.reflected * 100
  const useful = budget.useful * 100
  const description = `${blocked.toFixed(1)}% of incoming photons blocked by metal; ${reflected.toFixed(1)}% reflected; ${useful.toFixed(1)}% absorbed with enough energy to generate charge. Photon counts, not power efficiency.`
  return (
    <figure className="light-flow" aria-label={description}>
      <div className="photon-rays" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => {
          const fraction = (index + 0.5) / 24
          const kind = fraction < budget.blocked ? 'blocked' : fraction < budget.blocked + budget.reflected ? 'reflected' : fraction < budget.blocked + budget.reflected + budget.useful ? 'absorbed' : 'unused'
          return <span key={index} className={`photon-ray ${kind}`} />
        })}
      </div>
      <div className="light-flow-bar" title={description} aria-hidden="true">
        <span className="light-blocked" style={{ width: `${blocked}%` }} />
        <span className="light-reflected" style={{ width: `${reflected}%` }} />
        <span className="light-absorbed" style={{ width: `${useful}%` }} />
      </div>
      <figcaption><span>Blocked {blocked.toFixed(0)}%</span><span>Charge-generating {useful.toFixed(0)}%</span></figcaption>
    </figure>
  )
}
