export const defaultSettings = {
  wavelengthNm: 550,
  loadResistance: 0.002,
  rearThickness: 20,
  siliconThickness: 180,
  coatingThickness: 80,
  reflectedPercent: 5,
  fingerWidth: 60,
  fingerSpacing: 1.5,
}

export type PartSettings = typeof defaultSettings
export type SettingName = keyof PartSettings

type PartOption = {
  key: SettingName
  label: string
  unit: string
  min: number
  max: number
  step: number
  logarithmic?: boolean
}

// Geometry drives shading and resistance. Coating/rear thickness remain visual only.
export const partOptions: Record<string, PartOption[]> = {
  load: [
    { key: 'loadResistance', label: 'Load resistance', unit: 'Ω', min: 0.0001, max: 100, step: 0.0001, logarithmic: true },
  ],
  sun: [],
  'rear-contact': [
    { key: 'rearThickness', label: 'Metal thickness', unit: 'µm', min: 5, max: 50, step: 1 },
  ],
  silicon: [
    { key: 'siliconThickness', label: 'Absorber thickness', unit: 'µm', min: 50, max: 300, step: 1 },
  ],
  coating: [
    { key: 'reflectedPercent', label: 'Light reflected', unit: '%', min: 0, max: 100, step: 1 },
    { key: 'coatingThickness', label: 'Coating thickness', unit: 'nm', min: 40, max: 150, step: 1 },
  ],
  'front-contacts': [
    { key: 'fingerWidth', label: 'Finger width', unit: 'µm', min: 20, max: 250000, step: 1 },
    { key: 'fingerSpacing', label: 'Centre-to-centre spacing', unit: 'mm', min: 0.5, max: 500, step: 0.1 },
  ],
}
