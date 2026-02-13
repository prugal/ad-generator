## 2026-02-13

### Added
- Created `app/api/generate/route.ts` for server-side ad generation.
- Created `app/api/optimize/route.ts` for server-side SEO optimization.
- Created `services/adHelpers.ts` to share logic between API routes.
- Installed `@supabase/supabase-js` dependency.
- Integrated Supabase: added client `services/supabase.ts` and migration `20240213_create_generated_ads.sql`.
- Added history tracking: successful ad generations are now saved to `generated_ads` table in Supabase.

### Changed
- Refactored `services/geminiService.ts` to use server-side API routes instead of direct client-side calls.
- Updated `app/api/generate/route.ts` to log generation results to Supabase.
