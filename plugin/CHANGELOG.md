# 0.8.0-beta.4 - 2026-11-21

Open-source release with Chinese/English documentation, pinned build/test tooling, upstream notices, package repository/topics metadata and a Windows installer bundle. Prediction behavior and cache identities are unchanged from beta.3.

# 0.8.0-beta.3 — 2026-11-17

Add a saved prediction reasoning policy: off/minimum by default, explicit opt-in to parent/profile controls. Migration preserves the minimum default. Local result identities isolate policies. Switching does not automatically generate another paid prediction for the same turn. Bilingual native settings selector has an associated label, help text and explicit save.

# 0.8.0-beta.2 — 2026-11-17

Prediction and validation repair use disabled thinking when supported, otherwise the exact model minimum. Native adapter metadata is authoritative; portable Responses, Chat and Messages have protocol-specific controls and declarative aliases. Main conversation settings remain unchanged. Unknown controls stop before dispatch, with no paid probes or hidden fallback requests. Local result cache schema changes to avoid older inherited-High results. Record reasoning policy per attempt; recognize Anthropic thinking-token details without double billing.

# 0.8.0-beta.1 — 2026-11-17

First public npm preview under @jhckevin/dsh-composer-prediction. Declare a native DSH registry bundle, retain composer-prediction runtime/data identity, refresh bilingual details and installation/update guidance. Native Versions checks, compatibility, progress and rollback remain host-owned. Existing 0.7.5 prediction/cache/accounting behavior is retained.

## 0.7.5-experimental.1\n\nAdd generic Anthropic Messages and Chat Completions, JSON Responses, explicit optional capabilities, honest cache-unknown cost bounds and main-route price binding. Arm balance monitoring only after a real quota rejection; stop after recovery or model success. No paid compatibility probes or silent protocol fallbacks.\n\n# 0.7.4-experimental.1 — 2026-11-14

- Event-driven account balance watchdog using the official DeepSeek balance endpoint; no model generation to test funds and no timed polling.
- Insufficient balance pauses passive prediction only; manual retries bypass that pause. Positive balance revalidates each waiting source before restoring one automatic generation.
- Deduplicate account queries and logical checkpoints; reject stale responses after newer account outcomes.
- Separate live account state from historical rejected-attempt accounting.
- Add a native settings switch and owner-only balance-check action. Keys stay on the host and are never sent to guessed third-party balance endpoints.
- npm remains paused.

# 0.7.3-experimental.1 — 2026-11-14

- Batch native model-free tool pruning at logical request/turn boundaries; distinguish parent summary workflows. Native pruning alone does not grant another paid prediction.
- Require applicable exact prices before prediction dispatch even without a budget limit. Missing provider usage stops retries and further calls in that conversation.
- Show since-install complete accounting independently from historical price gaps; explain missing-price and missing-usage causes separately.
- Reconcile proven pre-generation 402 rejections with an immutable original receipt and separate evidence record.
- Group legacy notifications for display without rewriting original events; cache historical imports until explicitly invalidated.
- npm remains paused; local preview only.

# 0.7.2-experimental.1 — 2026-11-13

- Container-based responsive cost cards preserve all amounts and share in narrow conversation panes.
- Settings adapt to their actual available width, including split-pane desktop layouts.
- Layout changes do not initiate model requests. npm publication remains paused.

# 0.7.1-experimental.1 — 2026-11-13

- Native-flow wrapping and native scrollport, preserving full text on acceptance.
- Respect host command hints and restore owned CSS leases on hide/unmount.
- Distinguish routine context progress from true prediction invalidation.
- Queue events only on admission; current phase is read from the coordinator and jobs.
- Wake idle-state observers without fake activity or timer polling.
- No new automatic generation for background notices. npm publication remains paused.

# Changelog

## 0.7.0-experimental.1 — 2026-11-13

- Dedicated settings page, official DSH controls, Chinese and English metadata and documentation.
- Persistent workspace and conversation blacklists, cancellation and late-result protection.
- Native placeholder alignment; first-use Tab notice instead of an inline key hint.
- Chronological events. Existing validation, cache and accounting retained.
- Local preview only: npm publication paused by the user.
