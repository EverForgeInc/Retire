# Security and Privacy Requirements

1. Never request, collect, transmit, display, log, or store a full or partial SSN.
2. Require MFA for production.
3. Encrypt all traffic with TLS.
4. Encrypt database and object storage at rest.
5. Use role-based access and least privilege.
6. Maintain immutable audit records for profile, date, task, and attachment changes.
7. Medical and health-record uploads are disabled and prohibited by default. Scan any separately enabled nonmedical uploads for malware.
8. Restrict file types and sizes.
9. Do not permit classified information or CUI unless the deployment environment is separately authorized.
10. Block medical/health-document categories by default and warn against entering CAC credentials, passwords, bank details, ID-card images, diagnoses, or sensitive narratives into email-visible fields.
11. Provide account export and deletion.
12. Confirm that no SSN or partial SSN fields exist in the database, UI, logs, APIs, or exports.
13. Use secure cookies, CSRF protection, rate limits, and session expiration.
14. Validate and sanitize all user input.
15. Use signed URLs for file access.
16. Keep secrets outside source control.
17. Log security-relevant events without logging sensitive document contents.
18. Back up encrypted data and test restoration.
19. Conduct dependency scanning and static analysis in CI.
20. Add a visible disclaimer that the app is a planning tool and not an official government personnel system.

21. Email digests must contain the minimum necessary data: neutral task title, due window, status, and authenticated deep link. Do not include VA condition narratives, diagnoses, medical notes, document contents, or sensitive free text.
22. Use verified-email delivery, unsubscribe/pause controls, provider suppression handling, and auditable consent/preferences.
23. Protect digest preference and delivery endpoints against enumeration and cross-account access.
24. External storage references must be plain descriptive labels by default; do not fetch or crawl user-supplied private links.
