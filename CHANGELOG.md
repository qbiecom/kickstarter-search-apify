# Changelog

## [0.0.29] - 2026-09-15

### Added
- Added `excludeTerms` to exclude projects containing specified whole words or phrases in their title or description.
- Added exclusion matching tests, including protection against substring matches such as `STL` in `Castle`.

### Fixed
- Corrected the README input example so it is valid JSON.

## [0.0.28] - 2026-09-15

### Fixed
- Accepted category IDs supplied as numbers as well as strings.
- Corrected the documented status, percent-raised, and sort options.

### Added
- Added validation tests for category slugs and numeric category IDs.

## [0.0.27] - 2026-09-15

### Changed
- Reduced the maximum request retries from 1000 to 20 based on observed residential proxy success rates.
- Added retry count, proxy reuse, and request duration fields to pagination logs.
- Removed decorative result-limit log lines.

## [0.0.26] - 2026-09-15

### Changed
- Documented the expected Kickstarter JSON response and actor output shape.
- Preserved the existing raw fields and compatibility aliases in project output.

### Fixed
- Made derived project fields resilient to missing nested data and timestamps.

### Added
- Added fixture-based tests for normal and incomplete Kickstarter projects.

## [0.0.25] - 2026-09-15

### Fixed
- Restored `cheerio` as a runtime dependency because the aggregate `crawlee` entry point loads modules that require it during startup.

## [0.0.24] - 2026-09-15

### Changed
- Renamed the discovery warm-up helper to describe its session-cookie role.
- Removed obsolete seed extraction, fallback generation, and related logging.

## [0.0.23] - 2026-07-02

### Changed
- Switched Kickstarter discovery pagination to the current `discover/advanced.json` endpoint.
- Updated discover query serialization to match Kickstarter's current frontend, including bracket-array parameters such as `state[]` and `category_id[]`.
- Defaulted status searches to Kickstarter's current discover states: `upcoming`, `live`, and `late_pledge`.
- Reused the last successful pagination proxy for the next page to reduce retry churn while still rotating proxies after failures.

### Fixed
- Removed the dependency on the removed `.js-project-group[data-seed]` markup for pagination startup.
- Made missing seed extraction non-fatal now that the current JSON endpoint does not require a seed parameter.
- Fixed category input matching when the category is provided as a numeric ID.
- Preserved cookies from the initial discovery request for pagination requests.
- Updated pagination URL construction to increment `page` on the current JSON URL.

## [0.2.1] - 2026-06-08

### Changed
- Updated the Apify Actor base image from Node.js 20 to Node.js 24 LTS.
- Updated runtime dependencies:
  - `apify`: `^3.5.0` -> `^3.7.2`
  - `crawlee`: `^3.15.1` -> `^3.17.0`
  - `got-scraping`: `^4.1.2` -> `^4.2.1`
  - `cheerio`: `^1.1.2` -> `^1.2.0`
- Replaced deprecated Docker npm install flags with `--omit=dev --omit=optional` to avoid npm 10 build warnings.
- Await proxy URL generation during proxy validation for compatibility with current Apify/Crawlee proxy APIs.

### Fixed
- Resolved production npm audit vulnerabilities in transitive dependencies:
  - `axios`: `1.12.2` -> `1.17.0`
  - `follow-redirects`: `1.15.11` -> `1.16.0`
  - `brace-expansion`: `2.0.2` -> `2.1.1`
  - `minimatch`: `9.0.5` -> `9.0.9`
  - `ws`: `8.18.3` -> `8.21.0`
- Removed the default `woe_id=0` query parameter from Kickstarter discovery URLs. Location searches still add `woe_id` when a location is provided.
- Retire blocked sessions when Kickstarter returns a 403 while fetching the initial search seed, allowing retries to rotate to a new proxy/session.
- Improved pagination response handling when Kickstarter returns an unexpected non-projects response, logging useful diagnostics and retrying with a new proxy/session instead of failing with a `projects.slice` error.

## [0.2.0] - 2025-10-03

### Changed
- **BREAKING**: Upgraded to Apify SDK v3 (from v2.0.6)
  - Migrated from `Apify` to `Actor` namespace
  - Updated all API calls: `Apify.main()` → `Actor.main()`, `Apify.getInput()` → `Actor.getInput()`, etc.
  - Removed SQLite dependency (better-sqlite3-with-prebuilds), fixing build issues
  - Replaced `requestAsBrowser` with `got-scraping` library (as per v3 migration guide)
- Updated Node.js base image to version 20 (from 16)
- Updated dependencies:
  - `cheerio`: ^1.0.0-rc.9 → ^1.0.0
  - `moment`: ^2.29.1 → ^2.30.1
  - `@apify/eslint-config`: ^0.1.3 → ^0.4.0
  - `eslint`: ^7.0.0 → ^8.0.0
- Added dependencies:
  - `crawlee`: ^3.0.0 (web scraping library, contains BasicCrawler and other crawlers)
  - `got-scraping`: ^3.2.0 (replaces `requestAsBrowser` functionality)

### Fixed
- Resolved Docker build failures on Apify platform caused by missing Python dependency for native module compilation
- Fixed undici/File runtime error by upgrading to Node.js 20 (Node 18.20.8 has compatibility issues with undici)
- Improved compatibility with Node.js 20

### Migration Notes
If you have any custom code extending this actor, update your imports:
- `const Apify = require('apify')` → `const { Actor, log } = require('apify')`
- `const { BasicCrawler } = require('crawlee')` - Crawlers moved to separate Crawlee package
- `Apify.utils.log` → Import `log` directly from `apify` package
- `Apify.utils.requestAsBrowser` → Use `got-scraping` library directly (see [got-scraping docs](https://github.com/apify/got-scraping))
- `Apify.BasicCrawler` → `BasicCrawler` from `crawlee` package
