# Boundaries

[简体中文](../boundaries.zh-CN.md) · [README](../../README.en.md)

| Condition | Behavior |
| --- | --- |
| Assistant error, interruption or cancellation | No automatic prediction |
| Draft, attachments, IME, menus or queued send | Never replace user input; hide ineligible suggestions |
| Conversation switch or late response | Recheck source and conversation; discard stale output |
| Repeated UI observations | Reuse results/in-flight work instead of calling again |
| New user send | Retire the old suggestion; await normal completion |
| External history edit | Re-map; suspend below the 50% retained-prefix estimate |
| Parent compaction/tool pruning | Use the new effective snapshot; classify the structural event |
| Context overflow | Choose complete units; skip if safe conversion is impossible |
| Insufficient evidence | Accept suggestion:false and show nothing |
| Length/language/viewpoint failure | Reject locally; at most one validation repair by default |
| Truncation enabled, length-only failure | Truncate within the threshold without a repair for length |
| Network failure | Up to three automatic retries by default; configurable; unresolved usage stops repeats |
| Automatic retry disabled | Suppress output and wait for manual retry |
| Reasoning policy changed | Save explicitly; no automatic regeneration for the same turn |
| Unknown provider controls | Require capability declarations; no paid probes |
| Explicit quota rejection | Pause passive predictions and arm recovery checks |
| No balance API | Do not invent a balance; manual retry remains available at the quota layer |
| Unknown price | Block automatic spending before dispatch |
| Missing final usage | Keep an unresolved entry and stop automatic repeats |
| Missing cache details only | Retain unknowns; compute available bounds/ranges |
| Mixed currencies | Report separately |
| Blocked workspace/conversation | Override default enablement and catch-up |

Balance monitoring starts only after an explicit main/prediction quota rejection and ends on recovery or a successful call. Official DeepSeek can use its balance API. Other eligibility, price and blocklist gates still apply to manual retries.

The default 24-hour, three-conversation window controls catch-up for existing conversations, based on user sends. It is not a prediction TTL. Saved results can remain reusable much later if their source still matches.

Prediction share is prediction cost divided by main-plus-prediction cost within the same conversation, currency and coverage period. Unknown history is not priced as zero. Estimates use recorded usage and price versions, not provider invoices.

Tests use synthetic context and mocked network traffic. They verify serialization, gates, lifecycle and accounting, not live provider balances, cache retention or suggestion quality. Demo screenshot amounts are not evidence of real savings. Windows script tests validate dry-run parameters/checksums without installing DSH.
