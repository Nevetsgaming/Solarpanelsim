# Optical model

Calculations live in `src/physics/optics.ts` and do not depend on React or the drawing.
Run their checks with `npm test` (Node.js 24 supports these TypeScript files directly).

## Data and units

Silicon alpha values are from M. A. Green, *Self-consistent optical parameters of
intrinsic silicon at 300 K including temperature coefficients*, Table 1 (2008).
[DOI](https://doi.org/10.1016/j.solmat.2008.06.009)
and [table PDF](https://subversion.xray.aps.anl.gov/AGIPD_TCAD/PyTCADTools/Attenuation/Silicon_absorption_coeff_visible_photon.pdf).

The app stores the 300–1200 nm rows at 10 nm intervals, with alpha in cm^-1.
Between rows, it interpolates log(alpha). Out-of-range requests are rejected.
Thickness in micrometres is multiplied by 0.0001 to obtain centimetres.
Absorption is `1 - exp(-alpha * thicknessCm)`, for one pass through silicon.

Photon energy is `h*c/wavelengthMetres`. Constants h, c, and the joule/eV
conversion use their exact SI values. The fixed optical input of 1000 W/m²
is an illustrative assumption. Photon rate is this input divided by photon energy
in joules. It changes with wavelength even though incoming power stays fixed.

## Teaching assumptions

The silicon bandgap is fixed at 1.12 eV, giving a cutoff near 1107 nm.
Actual source data includes absorption below that energy. We preserve that data
in the single-pass absorption result, but set the generation-capable fraction to
zero below the cutoff. This sharp cutoff is a teaching approximation, not a
complete model of phonon-assisted absorption near the silicon band edge.

Absorption is conditional on light entering silicon. Reflection, contact shading,
rear reflection, carrier collection, and electrical output are not calculated yet.
No thickness optimum is imposed: absorption grows with diminishing returns.
Rear and coating thickness controls remain visual only. Drawn heights are
exaggerated; contact widths and spacings share a drawing scale of 60 px/mm.
Colours identify silicon regions, not net charge. Reset restores all defaults.
