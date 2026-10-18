// An illustrative colour cue, not a colour-matching or solar-spectrum calculation.
// UV and infrared get symbolic colours because neither is visible to our eyes.
export function wavelengthColour(wavelengthNm: number) {
  if (wavelengthNm < 380) return '#8c74b6'
  if (wavelengthNm > 780) return '#a35d6a'
  const colours = [[380, 270], [440, 240], [490, 190], [530, 120], [580, 55], [620, 25], [700, 0], [780, 0]]
  for (let index = 1; index < colours.length; index++) {
    const [start, startHue] = colours[index - 1]
    const [end, endHue] = colours[index]
    if (wavelengthNm <= end) {
      const hue = startHue + (endHue - startHue) * (wavelengthNm - start) / (end - start)
      return `hsl(${hue} 75% 43%)`
    }
  }
  return '#a35d6a'
}
