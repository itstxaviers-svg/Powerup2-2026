# Progressive World Construction

The Power Up 2 World Map begins as one largely empty sky world. Each of the nine Unit cities is physically constructed inside that world through completion of its five learning games. Cities are not separate icons and are not prebuilt cities hidden behind fog. New architecture progressively appears as the learner plays.

`Assets/01-world/world-map.png` is the single permanent World Map base. Each city uses a custom position, scale, stacking order, footprint fade, foundation mask, and four architectural masks. The build stage is derived directly from completed module count and is never persisted separately. At 5/5, the complete supplied Unit artwork is visible inside its feathered world footprint.

Because the Unit illustrations are flattened RGB PNGs rather than true transparent building layers, stages are architectural-region approximations made from aligned masked copies of the source art. Soft footprint masks blend their sky and cloud edges into the base world; they do not conceal completed architecture.
