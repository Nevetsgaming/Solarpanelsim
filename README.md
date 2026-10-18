# Solar Cell Lab

Hackathon project for learning how a solar cell works by building one and changing its design.

Instead of starting with a page of equations, try changing something and see what happens.

## What you can do

- Assemble the rear contact, silicon, anti-reflection coating and front contacts.
- Adjust thickness, reflection, finger width and spacing, then watch the maximum power update.
- Switch between sunlight and a single wavelength, or look at the cell from the top.
- Open Learn mode for explanations, a circuit diagram and clickable formulas.
- Try the finger-width challenge or save a design for comparison.

The app finds the best current–voltage combination automatically, as if an ideal controller were connected to the cell. Saved designs stay in memory until you refresh the page.


## How it is built

React and TypeScript handle the interface and calculations, with CSS and SVG for the visuals. Vite runs the development server and builds the site. Everything runs in the browser; there is no backend or database.

To follow the code:

- [App.tsx](src/App.tsx) stores the settings and connects the interface to the model.
- [components/](src/components/) contains the controls, cell views and explanations.
- [optics.ts](src/physics/optics.ts) calculates photon energy and silicon absorption.
- [spectrum.ts](src/physics/spectrum.ts) adds up contributions from the sunlight spectrum.
- [electrical.ts](src/physics/electrical.ts) calculates shading, resistance, current, voltage and maximum power.
- [data/](src/data/) contains the silicon absorption and solar-spectrum tables.


## Sources

- Sunlight: [ASTM G173 AM1.5 global-tilt spectrum](https://www.nlr.gov/grid/solar-resource/spectra-am1.5), bundled from the [pvlib data mirror](https://raw.githubusercontent.com/pvlib/pvlib-python/main/pvlib/data/ASTMG173.csv) and scaled to 1,000 W/m².
- Silicon absorption: [Martin A. Green (2008)](https://doi.org/10.1016/j.solmat.2008.06.009).
- Electrical model: [Sandia PVPMC single-diode model](https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/single-diode-equivalent-circuit-models/).
- The “Watch animation” link opens [PVEducation’s Light Generated Current animation](https://www.pveducation.org/pvcdrom/solar-cell-operation/light-generated-current), credited to Christiana Honsberg and Stuart Bowden. It is hosted by PVEducation, not copied into this project.
