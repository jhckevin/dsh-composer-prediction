# Features

[简体中文](../features.zh-CN.md) · [README](../../README.en.md) · [Failures and recovery](boundaries.md)

## From a reply to the next message

The plugin predicts **one message the user might send to the assistant next**. It does not answer as the assistant or execute the suggested request.

1. A user send starts a new turn.
2. After normal assistant completion, check conversation eligibility, blocklists, context mapping, pricing and unresolved requests.
3. Reuse a saved result or an in-flight job for the same source. Otherwise, request a prediction.
4. Show an eligible suggestion in the empty composer, wrapping with the input area. **Tab** inserts an editable draft. The user decides whether to send.

Errors, cancellation, interruption and unfinished replies do not trigger automatic prediction. Existing text, attachments, IME composition, menus and queued sends gate display and acceptance. Changing conversations shows only results owned by the selected conversation and still valid for its source.

Predictions do not enter real chat history or create a visible subthread. Only messages actually sent by the user become real input for the next turn.

## Conversation eligibility

| Item | Default and behavior |
| --- | --- |
| New conversations | Enabled by default; configurable |
| Individual conversation | Can be enabled, disabled or blocklisted |
| Workspace | Can be blocklisted; overrides defaults and catch-up |
| Existing-conversation catch-up | Latest 3 conversations with a user send within 24 hours; adjustable or disabled |
| Saved predictions | No time-based expiry; source validation still applies |
| Next user send | Removes the old suggestion; waits for normal completion of the new turn |

The 24-hour window selects catch-up candidates by **user send time**. It is not a result TTL. A month-old saved suggestion can remain usable if its source is still valid.

The logical watchdog checks mapping at sends, normal completions, turn/token budgets and structural events. It does not repeatedly scan chats on a seconds timer. Balance recovery is a separate mechanism.

## Context and two caches

The **local result cache** stores generated suggestions. Repeated UI observations and window switches do not purchase another prediction for the same source. Source identity includes the conversation, turn, context revision and relevant configuration. Display and acceptance recheck it; late responses cannot attach to another turn.

The **provider prefix cache** is controlled by the provider. Requests preserve reusable effective parent prefixes where possible and place changing prediction instructions near the end. Models, reasoning settings, tool definitions and early-history edits can affect reuse.

Context selection compares full effective context, prefix-plus-tail, local windows and frozen windows. Parent compaction is inherited; the plugin does not restore the full pre-compaction history. Tool calls and results retain complete pairing. This version has **no separate paid model job to summarize history**.

External history edits invalidate the old source and require remapping. If estimated reusable-prefix retention falls below **50%**, passive prediction pauses for that conversation. This local estimate is different from the provider's observed cache-hit ratio.

Context and repair selectors estimate cost from known tokens, prices and recent cache evidence. They do not guarantee a global optimum or a fixed hit rate. A long cached input may cost less than a short cold input.

## Backends and reasoning

Supports DeepSeek, OpenAI Responses, Anthropic Messages and OpenAI Chat Completions. Use the parent request configuration or a backend profile specifying endpoint, model, credential reference, capabilities and prices.

Reasoning defaults to **off / minimum**:

- Disable reasoning when the known model supports it.
- Otherwise use the lowest legal setting; this may still incur reasoning cost.
- To choose a higher setting, select **Use backend configuration** and save. Repairs follow the same policy.
- Unknown third-party aliases need declared capabilities. No paid capability probes or silent protocol fallback.

Configuration changes do not automatically buy another prediction for the current turn. Use manual retry when needed. Disabling reasoning can change compatibility with the parent's cache; actual usage remains authoritative. See [Protocol profiles](../../plugin/PROTOCOL-COMPAT.zh-CN.md) for fields.

## Instructions and local gates

The prompt requests one user-viewpoint message in the user's language. An assistant offer is not user consent. It must not invent tasks, facts, authorization or numeric prices. Insufficient evidence returns `suggestion:false`, leaving this turn without a suggestion.

Edit `instruction_prediction.md` in the plugin data directory for personal constraints. Mandatory reliability rules take precedence.

| Setting | Default |
| --- | --- |
| Preferred length | Normal; about 160 visible-text tokens |
| Visible suggestion hard limit | 999; configurable |
| Language | Detect from user prose; language check enabled |
| Truncation | Off |
| Automatic retry | On |
| Network retries | At most 3 additional attempts |
| Validation repair | At most 1 additional repair |
| Repair selection | Compare draft-only, parent regeneration and parent-with-draft estimates |

The hard limit excludes JSON syntax and hidden reasoning. Supported models use their tokenizer. Unknown models use a conservative UTF-8 byte upper bound, not an exact token count.

Other gates check invisible content, control characters, internal reasoning/tool markers, narration labels, obvious assistant viewpoint, verbatim assistant echoes, unsupported numeric prices and language/script mismatches. Language and intent checks have limits; review drafts before sending.

Optional truncation handles length only; the result must still pass other gates. Without truncation, length repair states the previous length, target and required absolute/percentage reduction. Automatic repair selection compares cost; it does not always resend the entire history.

## Costs and share

The accounting page is available from the conversation's upper horizontal plugin menu.

**Prediction share = Prediction / (main conversation + Prediction)**, calculated per conversation, currency and coverage period. Each physical request has its own entry, including automatic generation, manual retry, network retry and validation repair.

Each request captures the applicable pricebook and schedule at start. Peak/off-peak rates follow declared effective periods and timezones; there is no universal half-price rule. Protocol-specific input, cache reads and cache writes are normalized without double counting. Reasoning output is not charged twice.

Unknown prices block prediction before dispatch. Missing final usage after dispatch remains unresolved and stops further automatic spending. Historical gaps are separate from complete post-install coverage. A dash is not zero, and a known subtotal is not a complete share. See [Accounting troubleshooting](boundaries.md#accounting-troubleshooting).

## Data and updates

Settings, profiles, blocklists, results and accounting live in `~/.dsh/plugins-data/composer-prediction`. Selected context is sent to the configured model provider. Audit snapshots and diagnostics can contain chat content; do not post the whole data directory in a public issue.

Registry installations use DSH's native version checks, version details and update selection. Offline file sources do not have the same registry update source. See [Windows installation](windows.md) for installation, checksums and offline steps.

When a suggestion is missing, check the conversation's current status and special events before using [Failures and recovery](boundaries.md). Do not delete the ledger or repeatedly retry as a first step.
