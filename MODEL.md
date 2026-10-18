# Optical and electrical model

Calculations live in `src/physics/optics.ts` and do not depend on React or the drawing.
Run their checks with `npm test` (Node.js 24 supports these TypeScript files directly).

## Learning and comparison controls

The player always sees maximum power and its matching current and voltage. An
ideal controller selects the maximum-power operating point automatically. There
is no adjustable resistor or resistor-load mode in the UI. The independent
resistor-load solver remains in the physics module for numerical checks only.

The workspace starts in Build mode: only Parts and the canvas are shown. Learn
mode reveals the learning column and circuit-view option; clicking an electrical
reading also switches to Learn. Switching modes preserves the design.
Slider guidance is collapsed behind per-control question marks. Experiments
start collapsed, with separate accordion sections for challenge, last-change
feedback and saved comparison. An active challenge opens its own section.
The visual light indicator uses the same photon budget as the detailed readout:
the bar has exact fractions, while 24 rays are an illustrative sample, not a
time-resolved or spatial ray-tracing simulation. It does not represent energy
efficiency. Motion is limited to a short bar-width transition, disabled when
reduced motion is requested.

Finger width uses a logarithmic 20–250,000 µm slider, with an exact numeric input.
Silicon thickness uses a logarithmic 1–1,000 µm range, rounded to 0.1 µm, with
the default still at 180 µm. Thin layers expose a noticeable absorption/power
change even at 550 nm; there is no artificial electrical sensitivity multiplier.
The base drawing height is logarithmic too and remains explicitly not to scale.
Large widths display in mm or cm; the exact input stays in µm. Rear-contact and
coating thickness are marked Appearance only. Part descriptions and formula
explanations show a short takeaway first, with optional details.

The finger-width challenge assembles the default design in sunlight/maximum-power
mode and freezes all settings except width. Its baseline is calculated from that
same design, not a hard-coded target. Reset or undo ends the challenge.
Free experimentation and saving resume when the challenge ends.

One saved design stores a copy of settings, light mode, operating mode and results
in React memory until refresh. It can be restored; changing source or operating
mode is flagged as an unfair design comparison. Before/after feedback reports
computed shading, total series resistance and power changes rather than guessing
whether a slider movement helped.

The light budget counts photons, not energy efficiency. It separates metal
shading, reflection, below-bandgap photons, usable but unabsorbed photons and
usable absorbed photons. All five fractions sum to one. Below-bandgap photons
remain in their own category even if the absorption data records some absorption;
only energetic, absorbed photons can generate charge here. These counts precede
collection and electrical losses. The I–V plot uses the same diode equation and
series resistance as the solver, with selected and maximum-power points marked.

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
Finger width ranges from 20 to 250,000 µm (25 cm; default 60 µm) for exploration;
the extended range is not a recommendation for a practical grid. Centre spacing
ranges from 0.5 to 500 mm (default 1.5), independently of width.
Touching or overlapping fingers fully cover the surface and produce zero power.
Coverage includes partial edge fingers and counts overlapping metal only once.
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

The app starts and resets in sunlight mode. Constant wavelength remains available
as an experiment mode. Sun controls live beside the sun, without a duplicate
Sunlight options text section in Parts.

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
output displays Vmp, Imp and Pmax together. The internal resistor solver also
solves V = I*Rload on the same curve for tests, but is not exposed to the player.
The internal load-solver reference is 0.002 Ω; it does not affect displayed maximum
power. This is not a series-connected commercial module.
All four layers are required before electrical output is enabled.

At default settings in sunlight mode: Iph ≈ 336.974 A, Rs = 0.0004790625 Ω,
Vmp ≈ 0.432185 V, Imp ≈ 304.049 A and Pmax ≈ 131.406 W. These are outputs of
the illustrative model, not certified panel performance. The formula explorer
opens on the diode equation, with a drill-down from Iph to the supplied integral.
