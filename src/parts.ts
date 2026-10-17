// Assembly order, from the bottom of the cell to the top.
export const parts = [
  {
    id: 'rear-contact', name: 'Rear contact',
    description: 'The metal contact on the back collects current and connects the cell to an external circuit. Together with the front contacts, it provides the two electrical terminals.',
  },
  {
    id: 'silicon', name: 'Silicon',
    description: 'This example uses a thin n-type emitter above a thicker p-type base. They are differently doped regions of one silicon cell. Their boundary forms the p–n junction, whose electric field helps separate light-generated electrons and holes. Colours distinguish the regions, not electric charge; the drawing is not to scale.',
  },
  {
    id: 'coating', name: 'Anti-reflection coating',
    description: 'This thin optical layer reduces the light reflected from the front surface, allowing more light to enter the silicon.',
  },
  {
    id: 'front-contacts', name: 'Front contacts',
    description: 'Metal fingers collect current and carry it to larger busbars. Wider fingers reduce electrical resistance, but also block more incoming light.',
  },
]

export const learningTopics = [
  ...parts,
  {
    id: 'sun', name: 'Sunlight',
    description: 'Light supplies the energy. A photon with enough energy can generate an electron–hole pair in silicon. The contacts collect the resulting current through an external circuit.',
  },
  {
    id: 'emitter', name: 'n-type emitter',
    description: 'The thin front region is doped so electrons are its majority mobile carriers. It forms a p–n junction with the p-type base and provides a path to the front contacts. The region is electrically neutral overall, not a negatively charged slab.',
  },
  {
    id: 'base', name: 'p-type base',
    description: 'The thicker silicon region absorbs much of the incoming usable light. Doping makes holes its majority mobile carriers. A hole is a missing electron that behaves as a positive mobile carrier. The base is electrically neutral overall, not a positively charged slab.',
  },
]
