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

Single-pass absorption is conditional on light entering silicon. A direct reflected
percentage (default 5%, an illustrative assumption) is applied once the coating is
placed. Before coating placement, front reflection is not modeled. The fraction
of incident light absorbed is `(1 - reflectedPercent/100) * singlePassAbsorption`.
Reflection is applied once, not folded into alpha. Contact shading, rear reflection,
carrier collection, and electrical output are not calculated yet.
No thickness optimum is imposed: absorption grows with diminishing returns.
Rear and coating thickness controls remain visual only. Drawn heights are
exaggerated. The active footprint is fixed at 1000 × 1000 mm (1 m²).
This is a simplified continuous-grid teaching model, not a manufactured module
with separate silicon cells, gaps, glass, frame, encapsulant and interconnects.
Top-view SVG coordinates are millimetres; finger width converts from µm to mm.
Finger width ranges from 20 to 100,000 µm (10 cm; default 60 µm) for exploration;
the extended range is not a recommendation for a practical grid. Centre spacing
ranges from 0.5 to 200 mm (default 1.5), with at least a 0.1 mm gap between fingers.
Increasing width automatically increases spacing if necessary to prevent overlap.
The default layout has 667 finger centres across the width.
The 20 × 20 mm contact detail uses the same physical proportions as the overview.
The cross-section runs along one finger for the full 1 m length. It shows the
continuous finger and its two busbar crossings using the same 5 mm busbar widths
and 250/750 mm positions as Top view. Vertical heights are exaggerated. Finger
width and spacing lie out of this cut plane and are inspected in Top view.
Two 5 mm busbars at 250 and 750 mm, a 20 µm finger height, and a 0.5 µm emitter
depth are illustrative fixed assumptions, not an optimized grid or device calibration.
These dimensions are centralized in `src/panelGeometry.ts`. Area does not change
the optical fractions or per-area photon rate; electrical outputs remain placeholders.
Colours identify silicon regions, not net charge. Reset restores all defaults.

The light source buttons select constant-wavelength mode or a sunlight-spectrum
placeholder. Sunlight mode disables the wavelength slider and hides monochromatic
readings; it does not yet integrate a solar spectrum. Switching back preserves
the chosen wavelength. Reset returns to constant-wavelength mode.
