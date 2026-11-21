# Boundaries, failures and recovery

[简体中文](../boundaries.zh-CN.md) · [README](../../README.en.md) · [Features](features.md)

## A missing suggestion

Absence is not always a failure. Check current conversation status, an empty composer, normal assistant completion, the conversation switch and blocklists. The job may be queued, abstained or blocked by pricing, unresolved usage, quota or context validation.

| Condition | Behavior | Recovery |
| --- | --- | --- |
| Assistant error, cancellation, interruption or unfinished reply | No automatic prediction | Retry/continue the main conversation and await normal completion |
| Draft, attachments, IME, menus or queued send | Hide or prevent acceptance; never overwrite input | Finish the operation; reuse the result if its source remains valid |
| `suggestion:false` | Abstain for this turn | Continue chatting; abstention is not a network failure |
| Queued or generating | Join the same source's in-flight job | Wait; switching windows does not require another generation |
| Next user send | Hide the old result and await the next completion | No action needed |
| Conversation switch or late response | Validate ownership and revision; reject stale output | Check the destination conversation's own status |
| Disabled or blocklisted conversation/workspace | No automatic prediction | Adjust the relevant switch or blocklist |
| History cannot be read safely | Do not send context of uncertain ownership | Check host compatibility and loaded history; report if persistent |
| Configuration or reasoning change | Revalidate affected identity without automatically regenerating | Save; use manual retry if a new result is wanted |

Redisplay is not regeneration. Saved results have no time-based TTL, but source changes can invalidate them.

## Context and event logs

Events are ordered **oldest to newest**. Number 1 is the oldest retained entry, not a permanent conversation-wide ID. Only the latest 32 entries are retained. Current status describes the latest state.

A normal flow includes user send → assistant generation → normal completion → prediction generation → saved result. Initial snapshots, reuse and scheduling can add entries. Event count is not model-call count.

| Event | Meaning |
| --- | --- |
| Context updated | Effective source changed, possibly due to a normal tool step or message; not proof of a prediction request |
| Main-request snapshot recorded / mapping validated | Capture or check parent evidence; not another prediction call |
| Parent context compacted | Revalidate the new effective context; not a paid plugin summarization job |
| Old prediction invalidated | Source no longer matches; do not display the old result |
| Queued | Scheduling state, not proof of dispatch |
| Generating | Generation flow entered; physical attempts are tracked by the ledger |
| Saved, reusable | Result is available; source and composer checks still apply at acceptance |

Repeated compaction events without real compaction, or repeated generation after saving with no source change, should be investigated. They are not an expected cost-saving technique. Include surrounding events, actions and ledger request counts when reporting a problem.

External history edits invalidate the old source and require remapping. Estimated reusable-prefix retention below 50% pauses passive prediction for that conversation. This local estimate is distinct from an observed provider cache-hit ratio.

For context limits, select windows of complete messages/tool units. If safe representation is impossible, or the protocol cannot preserve image, tool or reasoning history, refuse dispatch. Use a compatible backend/profile or the parent's effective compacted context. Do not silently drop unknown content to clear an error.

## Local validation

Validation covers suggestion text and response shape. Malformed JSON, language/script mismatches, excess length, control characters, internal markers, narration, obvious assistant viewpoint, assistant echoes and unsupported numeric prices can cause rejection.

One automatic validation repair is allowed by default. A second invalid result stays hidden until the user decides whether to retry manually.

- **Length:** state the previous length and required reduction. Optional truncation keeps text within the limit without another repair for length alone. Other gates still apply.
- **Language:** emphasize the required language/script while preserving identifiers and paths. Code/logs should not determine user language.
- **Missing price or authorization evidence:** repair must not invent evidence. Abstain when a supported intent cannot be retained.
- **Oversized repair input:** enforce local input/output budgets rather than repeatedly submitting large drafts.

Automatic repair selection compares draft-only and parent-context costs. A smaller draft may lose parent cache reuse; token count alone is insufficient. With automatic retry disabled, failed output stays hidden and retry requires a manual action.

These are local heuristics, not complete semantic proof, a security review or a replacement for server enforcement. Review the draft before sending.

## Network, protocol and credentials

| Failure | Automatic behavior | Recovery |
| --- | --- | --- |
| Timeout, connection loss, 408, 429, 5xx and similar transient errors | At most 3 additional network retries for the whole task, if enabled | Check usage settlement before retrying |
| Provider waiting requirement | Honor Retry-After; stop if it exceeds the configured waiting budget | Retry later |
| 400/401/403/404/413/422, missing credential, unknown model or context limit | No repeated transient-error retry | Correct endpoint, credential reference, model or context |
| Certificate validation failure | Do not disable TLS validation | Fix certificate/network configuration |
| Unsupported capability or history conversion | No silent protocol switch or information dropping | Declare correct capabilities or use a compatible protocol |
| Dispatched request without final usable usage | Keep unresolved; stop further automatic spending | Retain the ledger and reconcile provider usage/diagnostics |

The network retry counter is shared by the **whole task**. Validation repair does not reset it. When usage is settled and all other gates permit, initial request + one repair + up to three network retries means at most five physical attempts. Failed calls are not assumed free. Default backoff starts at 400 ms, capped at 10 seconds, and can be cancelled.

Third-party model support does not imply balance APIs, cache controls, cache detail or official prices. Send declared capabilities only. Do not guess balance endpoints or pay to probe optional features. Unknown model reasoning controls require explicit protocol configuration; minimum does not always mean no reasoning.

## Insufficient balance

Only an **explicit quota rejection** from the main conversation or Prediction arms account-route recovery monitoring. Ordinary network errors do not.

1. Pause passive prediction for that account and retain potentially recoverable waiting sources.
2. Where a balance API is supported, coalesce checks at logical checkpoints. No seconds-based polling or paid generation as a balance probe.
3. Confirmed available balance or a successful model request ends this monitoring episode. Resume only waiting sources that still pass eligibility and revision checks.

Unsupported or failed balance queries mean **unknown**, not zero. Manual retry remains allowed at the quota layer so the user can continue after topping up. It cannot bypass blocklists, source checks, pricing or unresolved usage.

A recognized insufficient-balance rejection without generation is counted separately from a failure that might have consumed tokens. It is not a permanent disable flag, and requires evidence of rejection without generation.

## Accounting troubleshooting

**Prediction / (main conversation + Prediction)** requires the same currency and coverage period. Each physical prediction attempt is counted, including repairs and manual retries.

| Symptom | Meaning and action |
| --- | --- |
| Amounts exist but share is a dash | Known subtotals are not complete totals; inspect historical price/usage gaps and coverage labels |
| Unpriced requests | Never replace with zero. Separate old incomplete records from preflight pricing for new calls |
| Unresolved requests | Consumption may have occurred; stop automatic duplicates and retain evidence |
| Cache details missing | Cache hit remains unknown; use known totals and prices for bounds/ranges |
| Multiple currencies | Aggregate separately; no implicit exchange rate |
| Prices or peak/off-peak periods change | Check the price snapshot captured at each request start |
| Incomplete pre-install history | Use the separately reported complete post-install coverage; do not claim a full-conversation ratio |

For example, known main cost 1.549872 CNY and Prediction cost 0.029572 CNY give a known-subtotal ratio of about **1.8723%**. With another 91 unpriced requests, that is not an accurate full-conversation share.

The ledger estimates cost from provider usage and saved pricebooks. It is not the provider's invoice. Do not delete accounting data, replace unknowns with zero or omit repair costs to make the percentage appear complete.

## Reporting

Include plugin/DSH versions, protocol, model, redacted endpoint type, current status, action sequence, relevant request count and error code. Compare event counts with physical request counts; only the latter establish repeated spending. Do not publish API keys, full requests, chat snapshots or the entire plugin data directory.

See [Architecture](architecture.md) for mapping, selectors and accounting, and [Verification scope](../verification.zh-CN.md) for evidence boundaries. CI uses mocked model/network calls; it does not establish live balances, provider cache persistence or suggestion quality. Demo screenshot amounts are not measured savings.
