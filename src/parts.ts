// Assembly order, from the bottom of the cell to the top.
type LearningTopic = { id: string; name: string; description: string; detail?: string }

export const parts: LearningTopic[] = [
  {
    id: 'rear-contact', name: 'Rear contact',
    description: 'The back connection completes the circuit, giving charge a route through your device.',
    detail: 'The front and rear contacts are the cell’s two terminals. Neither supplies energy; absorbed light does.',
  },
  {
    id: 'silicon', name: 'Silicon',
    description: 'Silicon absorbs useful light. Its junction helps separate the charges that light creates.',
    detail: 'Small amounts of added atoms, called dopants, create n-type and p-type regions. Where they meet, an electric field helps separate electrons and holes. The colours identify regions, not net charge; layer heights are exaggerated.',
  },
  {
    id: 'coating', name: 'Anti-reflection coating',
    description: 'Less light bouncing away means more light can enter the silicon.',
    detail: 'Real reflection depends on wavelength, material, thickness and angle. Here you set the reflected percentage directly. The thickness slider changes only the picture.',
  },
  {
    id: 'front-contacts', name: 'Front contacts',
    description: 'Metal fingers carry current, but also shade the silicon. Wider fingers trade less resistance for more blocked light.',
    detail: 'The fingers collect current and carry it to the larger busbars. Use Top view to see how width and spacing change the covered area.',
  },
]

export const learningTopics: LearningTopic[] = [
  ...parts,
  {
    id: 'load', name: 'Load resistance',
    description: 'Your load sets the cell’s current and voltage together. The right balance delivers more power.',
    detail: 'In Resistor load mode, the cell and resistor must share the same current and voltage. Maximum power mode uses an ideal controller to choose the point where voltage times current is largest.',
  },
  {
    id: 'sun', name: 'Sunlight',
    description: 'Light supplies the energy. An absorbed photon needs enough energy to create an electron–hole pair.',
    detail: 'We hold incoming light power fixed. Longer-wavelength photons each carry less energy, so there are more of them for the same power—but photons beyond about 1107 nm cannot generate charge here.',
  },
  {
    id: 'emitter', name: 'n-type emitter',
    description: 'A few added atoms supply extra mobile electrons. Electrons are the main moving carriers here.',
    detail: 'Silicon atoms share electrons in bonds. Dopant atoms add an electron that can move more easily. At the boundary with p-type silicon, an electric field helps separate charges created by light. The whole region is still electrically neutral.',
  },
  {
    id: 'base', name: 'p-type base',
    description: 'Added atoms leave gaps called holes. These behave like moving positive charges.',
    detail: 'Picture an empty seat in a row: when someone moves into it, the empty seat shifts to where they were. Electrons filling missing bonds make holes appear to move in the same way. Holes are the main moving carriers here, but the region overall is neutral.',
  },
]
