# Optical and electrical model

Calculations live in `src/physics/optics.ts` and do not depend on React or the drawing.
Run their checks with `npm test` (Node.js 24 supports these TypeScript files directly).

## Data and units

Silicon alpha values are from M. A. Green, *Self-consistent optical parameters of
intrinsic silicon at 300 K including temperature coefficients*, Table 1 (2008).
[DOI](https://doi.org/10.1016/j.solmat.2008.06.009)
and [table PDF](https://subversion.xray.aps.anl.gov/AGIPD_TCAD/PyTCADTools/Attenuation/Silicon_absorption_coeff_visible_photon.pdf).

The app stores the 280–1200 nm rows at 10 nm intervals, with alpha in cm^-1.
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
Reflection is applied once, not folded into alpha. Electrical photocurrent then
includes contact shading and a fixed 95% carrier collection efficiency once each.
Rear reflection and thin-film interference are not modeled.
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
The cross-section cuts across fingers, between the busbars, so finger width and
spacing are visible and respond to their sliders. It shows a magnified three-pitch
detail (up to the panel width), with short silver contact blocks.
Vertical heights and a 1 px black outline are exaggerated for visibility. Busbars
remain visible in Top view; this cut does not pass through them.
Two 5 mm busbars at 250 and 750 mm, a 20 µm finger height, and a 0.5 µm emitter
depth are illustrative fixed assumptions, not an optimized grid or device calibration.
These dimensions are centralized in `src/panelGeometry.ts`. Area does not change
the optical fractions or per-area photon rate, but multiplies current in amperes.
Colours identify silicon regions, not net charge. Reset restores all defaults.

## Solar spectrum and photocurrent

Sunlight mode uses the ASTM G173-03 AM1.5 global-tilt column, 280–4000 nm.
[Primary spectrum description and download](https://www.nlr.gov/grid/solar-resource/spectra-am1.5).
The exact CSV table is bundled from the [pvlib mirror](https://raw.githubusercontent.com/pvlib/pvlib-python/main/pvlib/data/ASTMG173.csv)
as `src/data/solarSpectrum.ts`: all 2002 original samples, without resampling.
The NASA page supplied by the user links to the NREL/NLR spectra collection;
the space-based reference spectra on that page are not used as ground-level light.

Trapezoidal integration gives 1000.3706555734398 W/m² before normalization.
The full 280–4000 nm spectrum is normalized to 1000 W/m², including infrared power
that cannot generate pairs. No renormalization is performed on just the usable range.
Spectral photon flux is irradiance divided by photon energy in joules. Integrating
it times `(1-r) * (1-exp(-alpha*d))`, up to hc/Eg, and multiplying by q and area
implements the screenshot's ideal photocurrent. The final interval is split at
the exact cutoff. In monochromatic mode, the integral becomes a single spectral line.
The model then applies collection efficiency and unshaded fraction to get Iph.

Shading uses actual finger footprints, clipped at panel edges, and the union of
fingers and busbars so intersections are counted only once. Reflection is a chosen
constant across wavelength; coating thickness remains visual only.

## Single-diode equation and operating point

`I = Iph - I0 * expm1(q*(V + I*Rs)/(n*k*T)) - (V + I*Rs)/Rsh`.
[Equation source: Sandia PVPMC](https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/single-diode-equivalent-circuit-models/).
T = 300 K, n = 1.2, Rsh = 100 Ω, collection efficiency = 0.95 are illustrative.
I0 is calibrated once to Voc = 0.65 V at the default solar-spectrum design,
including the shunt term. This is a reference calibration, not a measured-device fit.

Series resistance combines a fixed 0.00005 Ω, emitter sheet flow and metal fingers:
`Rsurface = Rsheet * pitch² / (12*A)` with Rsheet = 80 Ω/square;
`Rfinger = rho * pitch * meanCollectionDistanceSquared / (width*height*A)`
with rho = 1.59e-8 Ω m. Collection distances use the two fixed busbar locations.
For the symmetric layout, mean squared distance is (0.25 m)²/3.
These distributed-current approximations assume uniform generation. Busbars are
ideal conductors; contact resistivity, rear resistance changes, and advanced
current crowding are omitted. Parameter sources/derivations:
[PV Education contact-loss code](https://github.com/pvedu/photovoltaic/blob/master/photovoltaic/cell.py).

The solver parameterizes the curve by junction voltage U = V + I*Rs. It brackets
Voc and the short-circuit point, then searches for the maximum of V*I. Maximum-power
mode displays Vmp, Imp and Pmax together. Resistor mode solves V = I*Rload on the
same curve and displays load voltage/current/power together. Moving the logarithmic
load slider selects resistor mode; switching back selects the ideal MPP controller.
Load range: 0.0001–100 Ω, default 0.002 Ω, appropriate to the low-voltage 1 m²
single-junction teaching geometry. This is not a series-connected commercial module.
All four layers are required before electrical output is enabled.

At default settings in sunlight mode: Iph ≈ 336.974 A, Rs = 0.0004790625 Ω,
Vmp ≈ 0.432185 V, Imp ≈ 304.049 A and Pmax ≈ 131.406 W. These are outputs of
the illustrative model, not certified panel performance. The formula explorer
opens on the diode equation, with a drill-down from Iph to the supplied integral.
