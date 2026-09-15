# TODO

## Input And Filters
- Verify all input filters against the current Kickstarter API: category, status, pledged, goal, raised, sort, query, and location.
- Confirm whether `raised` is still supported by the current API or should be removed/renamed.
- Add validation coverage for category slugs and numeric category IDs.
- Check whether `agg_fields` should be included for compatibility with Kickstarter's current frontend requests.

## Maintenance
- Add a smoke-test input for Apify builds that fetches a small number of projects from a stable category.
- Update README or actor description with the current API-backed behavior after the cleanup is complete.
