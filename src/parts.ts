// Assembly order, from the bottom of the cell to the top.
export const parts = [
  {
    id: 'rear-contact', name: 'Rear contact',
    description: 'The cell needs two connections so charge can travel through an outside circuit. This metal layer is the connection on the back; the front contacts provide the other one. Together, they let the cell supply a device rather than just build up charge.',
  },
  {
    id: 'silicon', name: 'Silicon',
    description: 'This is where light can create moving charges. We have given the top and bottom regions slightly different ingredients, called dopants. Where those regions meet, an electric field helps separate the electrons and holes created by light. Click either region to learn more. The colours just help you tell them apart, and the layer heights are exaggerated so you can see them.',
  },
  {
    id: 'coating', name: 'Anti-reflection coating',
    description: 'Some light bounces off a solar cell before it can do anything useful. This coating helps more light enter the silicon instead. In a real cell, its material and thickness affect which wavelengths are reflected, and the angle matters too. Here you choose the reflected percentage yourself. The thickness slider only changes the drawing, so you can explore reflection without a thin-film optics model.',
  },
  {
    id: 'front-contacts', name: 'Front contacts',
    description: 'These thin metal strips are called fingers. They collect current from the silicon and carry it to the wider strips, called busbars. Making a finger wider gives current an easier path, but it also covers more silicon and blocks sunlight. Try changing the width: can you find a balance that gives more power?',
  },
]

export const learningTopics = [
  ...parts,
  {
    id: 'load', name: 'Load resistance',
    description: 'The load stands in for a device using your cell’s electricity. Its resistance controls how easily charge can flow. Changing it changes both current and voltage, so the power changes too. In Resistor load mode, we find the point where the cell and your resistor agree. Maximum power mode instead chooses the point that delivers the most power, as if an ideal controller were doing that job.',
  },
  {
    id: 'sun', name: 'Sunlight',
    description: 'Light arrives in packets of energy called photons. If a photon is absorbed and has enough energy, it can free an electron in silicon, leaving a hole behind. The junction helps separate those charges, and the contacts give them a route through the circuit. Try one wavelength to study a single colour, or sunlight to see a mixture of wavelengths.',
  },
  {
    id: 'emitter', name: 'n-type emitter',
    description: 'Imagine silicon atoms holding hands by sharing electrons. We add a small number of atoms that bring an extra electron, which can move around more easily. That makes this region n-type: electrons are its main moving charge carriers. The n-type region meets the p-type region at a junction, where an electric field helps separate charges created by light. The “n” does not mean this whole layer is negatively charged; overall, it is neutral.',
  },
  {
    id: 'base', name: 'p-type base',
    description: 'Here we add atoms that leave an electron missing from a bond. Picture an empty seat in a row: when someone moves into it, the empty seat appears where they used to be. Electrons do something similar, so the gap seems to move. We call that gap a hole, and it behaves like a positive charge carrier. Holes are the main moving carriers in p-type silicon. This thicker region absorbs much of the useful light, but the region as a whole is still electrically neutral.',
  },
]
