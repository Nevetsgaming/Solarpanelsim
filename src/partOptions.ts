export const defaultSettings = {
  wavelengthNm: 550,
  loadResistance: 10,
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

// Wavelength and silicon thickness drive optics; the other settings affect only the drawing.
export const partOptions: Record<string, PartOption[]> = {
  load: [
    { key: 'loadResistance', label: 'Load resistance', unit: 'Ω', min: 0.1, max: 100, step: 0.1 },
  ],
  sun: [
    { key: 'wavelengthNm', label: 'Wavelength', unit: 'nm', min: 300, max: 1200, step: 1 },
  ],
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
