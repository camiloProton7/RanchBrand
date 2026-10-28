# Exploration reference V3

Scope: only `/explorar` on `feature/ranch-interactive-exploration`. No home, product, checkout, root component or main-branch modifications.

## Art direction and asset provenance

The owner-approved `Collage UI de The Ranch.png` supplied in the conversation is the visual source. The rider is an isolated raster cutout of its first mobile screen, not an SVG approximation and not a new 3D model. The terrain retains reference mountain artwork; cleared interactive areas have additional natural contour geometry. Labels, category icons, paths, waypoints, compass and interactions are live HTML/SVG/CSS. This is not a static screenshot pretending to be a storefront.

The source collage limits native detail: rider 71 x 205 px, ground 284 x 513 px. Larger production master artwork remains desirable. The movement is a 2D cutout with subtle oscillation, rotation and travel, NOT a rigged four-leg walk cycle. Do not describe it as fully realistic gait or pixel-identical reproduction.

## Navigation and safety

Verified existing category handles come from NAV_ITEMS. Niños uses `/search?q=ni%C3%B1os` until a verified children collection is configured; no products, prices or collections were invented. Native links work before JavaScript. Reduced motion bypasses the animated journey. Escape, hidden tabs and component unmount cancel pending navigation. New assets are self-hosted. The existing root header retains real menu, search and cart actions, with a route-scoped light theme. Other commercial pages retain the existing storefront design.

The production workflow on this branch remains main-only. Preview still explicitly uses `hydrogen deploy --preview`. Deployment URL logging is restricted to public Oxygen preview origins and strips all query/authentication parameters.

## Validation executed before committing

Chromium local fixture using the same scene markup, CSS and motion module; storefront header represented by a fixture, not a full authenticated Shopify session.

Passed: all artwork loaded; five native category links; Gorras selects `/collections/gorras`; drag updates position; hoofprints appear; Escape cancels pending navigation; reduced motion immediately selects Camisas; cleanup removes marks; no JavaScript errors; no horizontal overflow at 320, 375, 390, 430 and 1440 px widths.

CI compilation and Oxygen deployment results must be checked separately. Physical iPhone/Android testing and end-to-end checkout have not been performed. Existing reference product screens in the collage are not implemented by this change.
