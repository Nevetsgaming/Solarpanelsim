export const defaultSettings = {
  rearThickness: 20,
  siliconThickness: 180,
  coatingThickness: 80,
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
}

// These ranges are for exploring the drawing, not a calibrated device model.
export const partOptions: Record<string, PartOption[]> = {
  'rear-contact': [
    { key: 'rearThickness', label: 'Metal thickness', unit: 'µm', min: 5, max: 50, step: 1 },
  ],
  silicon: [
    { key: 'siliconThickness', label: 'Absorber thickness', unit: 'µm', min: 50, max: 300, step: 1 },
  ],
  coating: [
    { key: 'coatingThickness', label: 'Coating thickness', unit: 'nm', min: 40, max: 150, step: 1 },
  ],
  'front-contacts': [
    { key: 'fingerWidth', label: 'Finger width', unit: 'µm', min: 20, max: 120, step: 1 },
    { key: 'fingerSpacing', label: 'Centre-to-centre spacing', unit: 'mm', min: 0.5, max: 3, step: 0.1 },
  ],
}
