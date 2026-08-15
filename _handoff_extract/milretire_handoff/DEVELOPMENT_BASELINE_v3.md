# Development Baseline v3

This package supersedes v2 and is the authoritative project baseline.

Key decisions:
1. No full or partial SSN collection.
2. No completion initials. Completion is status plus audited actor/timestamp and optional completion date.
3. VA conditions include narrative and structured functional-impact tracking.
4. Medical records remain outside the app by default; the app tracks requests, completeness, summaries, and external secure-storage references.
5. Users can receive privacy-filtered daily or weekly active-section checklist digest emails.

Canonical sources remain `checklist_data.json`, product/business/security requirements, database/API contracts, and module JSON files.
