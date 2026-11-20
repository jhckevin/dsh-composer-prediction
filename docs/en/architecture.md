# Architecture

[简体中文](../architecture.zh-CN.md) · [README](../../README.en.md)

## Two caches

ResultCache stores a completed suggestion by conversation, source revision, turn, backend and effective settings. Reusing a result makes no model call. Default-valued reasoningMode is omitted from the legacy minimum-policy key to preserve existing results.

Provider caching reuses request prefixes. Preserve stable instructions, tools and history order; append prediction instructions near the end. Provider usage, not a local estimate, confirms a hit.

## Lifecycle

SessionLifecycle and EventCoordinator read an effective source snapshot, check eligibility and look for a saved result. A new call goes through context selection, reasoning/price/quota preflight, transport, accounting and local validation. The source is checked again before storing, displaying or accepting a result. Late results are discarded.

Prediction is an isolated plugin job. It does not append a real user message or create a visible prediction conversation. This is not a claim of access to Codex's private server-side forks.

## Context

Parent compaction is inherited from the effective model context; old raw history is not reconstructed. Portable paths can compare full, prefix-tail, local-window and frozen-window plans. Native sampling prioritizes the parent context. Tool calls and results stay paired.

Selection considers input size, reusable prefix, observed cache ratio, prices and a quality allowance. Frozen windows avoid moving boundaries every turn. This version does not purchase a separate LLM summarization call. Existing parent summaries remain usable history.

External edits, tool structure changes and parent compaction trigger mapping validation. An estimated retained reusable prefix below 50% suspends the conversation rather than repeatedly purchasing a new cache.

## Recovery

RecoverySelector compares draft-only repair, parent regeneration and parent-plus-draft repair. It uses recent exact-request usage where available, discounts cache evidence and includes output cost. Unknown reasoning reserves a conservative output bound. This bounded heuristic is not a proof of global optimality.

## Protocols and reasoning

The default disables thinking when supported, otherwise selects the model minimum. Native adapters advertise exact-model controls; portable routes use known-model rules or declared reasoningControl. Unknown aliases are rejected locally rather than probed with paid calls.

Explicit reasoningMode=configured preserves parent/profile controls. Repairs use the same policy. Changing settings does not automatically regenerate the current turn.

Responses, Messages and Chat have separate field and usage handling. No silent protocol switching occurs. Strict translation refuses history it cannot preserve; explicit portable-text migration records degradation.

## Accounting

Each physical attempt has a pending entry and settlement. Retries and repairs are separate costs. Unresolved usage stops further automatic spending.

Messages/DeepSeek input components differ from inclusive Responses/Chat totals. Cached input and thinking output must not be added twice. Each attempt retains its starting price version and schedule timezone. Currencies and coverage periods remain separate.

## UI

Suggestions occupy an eligible empty composer. Input, IME, attachments, menus, queued sends and running states gate display. Tab rechecks conversation, source revision, turn and draft revision before inserting editable text.

Settings use native DSH primitives and locale changes. Costs use a conversation tab.

Core files: [engine](../../plugin/src/core/engine.mjs), [context mapping](../../plugin/src/core/context-mapping.mjs), [recovery selector](../../plugin/src/core/recovery-selector.mjs), [transports](../../plugin/src/core/transports.mjs), [billing](../../plugin/src/core/billing.mjs), [client](../../plugin/src/client).
