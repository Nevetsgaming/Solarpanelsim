import type { PartSettings } from './partOptions.ts'
import type { ElectricalResults, OperatingMode } from './physics/electrical.ts'

export type DesignSnapshot = {
  settings: PartSettings
  isSunlight: boolean
  mode: OperatingMode
  results: ElectricalResults
}

export function widthFromSlider(position: number) {
  return Math.max(20, Math.min(250000, Math.round(20 * (250000 / 20) ** (position / 1000))))
}

export function widthToSlider(width: number) {
  return Math.log(width / 20) / Math.log(250000 / 20) * 1000
}

export function formatWidth(widthUm: number) {
  if (widthUm >= 10000) return `${Number((widthUm / 10000).toFixed(3))} cm`
  if (widthUm >= 1000) return `${Number((widthUm / 1000).toFixed(3))} mm`
  return `${widthUm} µm`
}

export function powerDifference(previous: number, current: number) {
  const delta = current - previous
  if (Math.abs(delta) < 1e-8) return 'Power stayed the same.'
  const amount = Math.abs(delta)
  const reading = amount < 0.01 ? amount.toExponential(2) : amount.toFixed(2)
  return `Power ${delta > 0 ? 'increased' : 'decreased'} by ${reading} W.`
}

export function explainChange(previous: DesignSnapshot, current: DesignSnapshot) {
  if (!previous.results.assembled || !current.results.assembled) return 'Complete the assembly before comparing electrical output.'
  if (previous.isSunlight !== current.isSunlight || previous.mode !== current.mode || (!current.isSunlight && previous.settings.wavelengthNm !== current.settings.wavelengthNm)) {
    return 'The light source or operating conditions changed. For a fair design comparison, keep these the same.'
  }
  const messages: string[] = []
  const shadeChange = previous.results.unshadedFraction - current.results.unshadedFraction
  const resistanceChange = current.results.seriesResistance - previous.results.seriesResistance
  if (Math.abs(shadeChange) > 1e-10) messages.push(`Your contacts now block ${shadeChange > 0 ? 'more' : 'less'} light.`)
  if (Math.abs(resistanceChange) > 1e-12) messages.push(`Total series resistance ${resistanceChange > 0 ? 'rose' : 'fell'}.`)
  if (previous.settings.siliconThickness !== current.settings.siliconThickness) messages.push('The silicon absorption changed; this model adds no thickness-dependent penalty.')
  if (previous.settings.reflectedPercent !== current.settings.reflectedPercent) messages.push(`You reflected ${current.settings.reflectedPercent > previous.settings.reflectedPercent ? 'more' : 'less'} light.`)
  messages.push(powerDifference(previous.results[previous.mode].power, current.results[current.mode].power))
  return messages.join(' ')
}
