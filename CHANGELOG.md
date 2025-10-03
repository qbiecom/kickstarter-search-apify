# Changelog

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