# Medical Record Privacy Model

The MVP does not store medical files. It stores only workflow metadata and user-controlled references.

## Stored
- Record category
- Facility or office
- Request and receipt dates
- Complete/partial/missing status
- Follow-up note
- Short evidence summary
- External secure-storage label chosen by the user

## Not stored by default
- Medical, dental, behavioral-health, C&P, imaging, lab, operative, or pharmacy files
- Diagnoses or detailed narratives in email
- Credentials or private-link tokens
- Any portion of an SSN

A future medical-upload feature requires a separate threat model, hosting/compliance determination, data-retention policy, security review, and explicit opt-in feature flag.
