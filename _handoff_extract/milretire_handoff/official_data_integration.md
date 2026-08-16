# Official Data Integration Strategy

## Summary

The app should automatically update official rates where a stable authorized interface exists. Where no official public API exists, use a controlled ingestion process with validation, versioning, and an administrator approval step. Never silently scrape and overwrite financial tables.

## VA disability compensation

### Available official resources

- VA publishes the current disability compensation tables on VA.gov.
- VA Lighthouse provides benefits and claims APIs, but the public Benefits Reference Data API covers claim reference values such as disabilities, countries, service branches, and facilities. It does not currently expose the full disability compensation payment-rate matrices.
- Claims-status and claim-submission APIs require VA authorization and should be treated as a later integration, not an MVP dependency.

### Recommended implementation

Create a `benefit_rate_versions` table and an annual VA-rate import job.

The import process should:
1. Fetch the official VA compensation-rate page.
2. Parse all rating/dependent combinations into a staging table.
3. Compare the new table against the currently approved version.
4. Flag additions, removals, and changed amounts.
5. Require administrator review and approval.
6. Publish the approved rate version with effective date and official source URL.
7. Preserve all prior rate versions for historical calculations.

Provide a manual CSV/JSON import fallback if the official page format changes.

Do not calculate a member's actual VA entitlement unless the user supplies the rating and dependent configuration. Label all pre-rating values as scenarios or estimates.

## Military retired pay

### Available official resources

- DoD Military Compensation publishes retirement plan rules and calculators.
- DFAS manages retired pay, but there is no generally available public API that returns a member's personal retired-pay entitlement.
- The DoD High-3 calculator currently warns that its calculations are approximations.

### Recommended implementation

Use an internal deterministic calculation engine based on:
- retirement system
- DIEMS/DIEUS
- high-36 basic-pay history or user-entered high-3
- creditable years and months of service
- applicable multiplier
- retirement date
- annual COLA assumptions when projecting future years

Import official military basic-pay tables into versioned tables. Provide an administrator import process from official DoD pay-table files or pages. Keep source URL, effective year, import hash, review status, and publication date.

For the MVP:
- Let the user enter an official estimate from myFSS/DFAS or a manually calculated high-3.
- Independently calculate an app estimate.
- Display both and show the difference.
- Clearly label the app result as an estimate.

## Personal VA or DFAS data

Do not attempt to log in by collecting a user's VA.gov, myPay, CAC, or DS Logon credentials.

Future integrations should use official OAuth or approved agency APIs only. VA Lighthouse APIs may support authorized claim and eligibility use cases after onboarding. DFAS personal-account integration should not be assumed unless DFAS publishes and authorizes an interface.

## Exchange rates

Use a reputable exchange-rate API with:
- daily timestamp
- stored historical rate
- source name
- user override
- fallback to last known rate

## Cost-of-living data

There is no single authoritative government source for every international city and expense category. Support:
- user-entered values
- administrator-curated values
- optional third-party providers
- source/date/confidence for every estimate

Never present third-party COL estimates as official government entitlements.
