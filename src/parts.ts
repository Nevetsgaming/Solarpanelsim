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
    id: 'load', name: 'Load resistance',
    description: 'The load represents an external device using the cell’s electrical output. Resistance describes how strongly it opposes current. This control stores your chosen resistance; electrical calculations will be added later.',
  },
  {
    id: 'sun', name: 'Sunlight',
    description: 'Light supplies the energy. A photon with enough energy can generate an electron–hole pair in silicon. The contacts collect the resulting current through an external circuit.',
  },
  {
    id: 'emitter', name: 'n-type emitter',
    description: 'Silicon atoms share electrons in bonds. In the thin front region, a few added atoms bring an extra electron that can move easily. This is called n-type silicon: most moving charge carriers are electrons. Where it meets p-type silicon, a junction helps separate the electrons and holes created by light. The region as a whole is electrically neutral.',
  },
  {
    id: 'base', name: 'p-type base',
    description: 'In the thicker base, a few added atoms leave an electron missing from a bond. Think of that gap as an empty seat: when a neighbouring electron fills it, the empty seat moves to where that electron came from. This moving gap is a hole and behaves like a positive charge carrier. In p-type silicon, holes are the majority mobile carriers. The base absorbs much of the usable light and is electrically neutral overall.',
  },
]
