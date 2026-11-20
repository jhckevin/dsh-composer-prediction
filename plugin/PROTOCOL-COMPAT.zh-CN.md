# 第三方协议兼容与计费说明（0.7.5）
本版不需要先填写服务商名单。接入按协议及显式能力配置，模型名称不是服务商身份，也不是价格凭据。

## 接入
将 examples/profiles 中对应 JSON 模板复制到插件数据目录的 profiles，替换 Base URL、model、accountId 和 credential 引用，再在设置选择配置文件。所有价格必须填写服务商自己的价表；模板不包含价格，选择后不会自动发出未定价预测。复制 templates 不执行登录、不创建 API 密钥。

- chat-completions：POST {baseURL}/chat/completions，Bearer 默认鉴权，JSON 非流式最终 usage。
- anthropic-messages：POST {baseURL}/messages，x-api-key 默认鉴权，anthropic-version 默认 2023-06-01，可用 request.anthropicVersion 覆盖。Base URL 应含实际 API 前缀（例如 /v1）。
- responses：POST {baseURL}/responses，Bearer 默认鉴权，支持 responseMode=json 或 sse。新模板用 JSON；既有配置默认 SSE。完整 endpoint 也可以作为 Base URL，不重复追加后缀。
- deepseek-messages：保留原 DSH 官方适配器、投影、精确父请求前缀路径，不改成通用翻译。
- codex-native：仍需真实原生 bridge；通用 Responses 不冒充 Codex 的内部实现。

每次 transport 只发一个物理请求，不暗中探测、删字段重发、换协议、换账户或调用收费模型测余额。网络重试仍受插件设置、费用核对和上限控制；每次物理请求独立入账。应用状态切换不改变既有复用规则。

## 可选能力
capabilities 允许：
- responseMode: json / sse（Chat、Messages 当前仅 JSON；预测不需要逐 token 展示，最终回复便于获取 usage）
- auth: bearer / x-api-key
- reasoning、temperature、tools: 布尔
- cacheKey、cacheRetention、storage、background: 布尔（Responses 的可选字段）
- usage: native / totals-only

通用路由默认不继承父模型的推理配置，不添加服务端会话 ID、上次 response_id、厂商缓存提示。OpenAI 官方 origin 会启用它自己的缓存 key/retention 及 store=false、background=false 字段；第三方需要声明能力。原生 Responses wire 快照已有的缓存字段原样保留，store/background 被强制关闭；持久 conversation 写入始终禁止。声明 storage=false 表示不发送该字段，不能保证第三方服务端不留存数据。

Chat 的 request.maxTokenField 可选 max_tokens（默认）或 max_completion_tokens；统一用 request.maxTokens 设值。Beta 2 由预测策略按模型选择最低思考控制并覆盖旧 request.thinking／reasoning 高档；未知别名用 reasoningControl 声明能力。未知能力字段、非法鉴权、密钥内嵌均在读取配置时拒绝。鉴权只解析当前配置的 credential.env / secretRef，不复用其他端点凭证；不跟随 HTTP 重定向。设置“重新加载配置”会刷新价格绑定与配置作用域。

## 上下文与缓存
- 保留父快照的当前上下文；翻译后的历史、工具定义和顺序确定，预测指令只追加尾部。
- strict 默认：不支持的 opaque replay、推理内容、图片/附件引用、动态工具更新等本地拒绝，不假装已经无损迁移。
- portable-text 是显式跨后端迁移：剔除不可迁移的推理/重放元数据与动态更新块，保留可见文本及完整工具调用/结果配对，并记录 removed 元数据。不会静默丢弃图片附件；仍需可投影的原生路径。Messages 不能原生表达的中途 developer/system 指令，会明确编码为历史文本，记录语义降级；不宣称原生同等优先级。
- 不完整工具配对、强制工具执行、不支持的关键字段在本地停止。不会为通过请求而随意删除上下文。
- Responses cacheKey 开启时沿用父 affinity，否则使用稳定父 sessionId，长 ID 确定性 hash；不创建随机子 key。自定义 sessionHeader 可显式绑定路由。
- Messages 可配置 cache.control={type:"ephemeral",ttl:"5m"}（或1h）：标记稳定 system 尾部及原始历史尾部，不标记变化的预测指令。启用前须配置 cacheWrite 单价；单一写入费率须与实际 TTL 一致，不支持混用 TTL 的分档精算。
- Chat 依赖提供商自身前缀缓存；不把 OpenAI/DeepSeek 专属提示强行发给所有第三方。
- 能否跨主请求命中，只能由同账号/端点、真实 wire 前缀及服务端 usage 证明；跨协议翻译不保证缓存相同。已有的 50% 缓存保留门仍生效，无法证明命中不等于制造命中。

## 计费与主请求绑定
pricing.versions 填真实生效日期、币种和每百万 token 单价 input / cacheRead / output，Messages 写缓存另填 cacheWrite。峰谷可以使用已有 weekly schedule 与明确时区；DeepSeek 官方峰谷规则不套给第三方。每个请求保存开始时的报价版本。

1. 有完整 cache 明细：按实际分项计费，推理 token 属于输出，不重复叠加。
2. 只有完整输入/输出总量：缓存字段保留 null，显示保守费用上界（输入总量乘适用输入类最高单价，再加输出），以及可计算的范围；不是精确账单。预测可显示和复用，不为补明细重发。缓存命中率显示未知。
3. Messages 原生 input_tokens 只表示未读写缓存的输入；不能把它无条件当总量。若服务商明确把该字段定义为完整输入，可以显式选 usage=totals-only；否则缺少缓存分项时不伪造完整计费。
4. 连总 usage 都缺失/不一致，或网络断开导致结果不明：留待核对记录，停止自动重复调用。无法保证这种故障下取得服务端账单，不能把它记成免费。
5. HTTP 明确4xx前置拒绝（不含408），无生成及 usage 证据时单独记录为拒绝且未计费；若错误响应包含 usage，照样保留计费，不能覆盖为0。2xx后流式失败不算前置免费拒绝。
6. 第三方主请求使用配置的 mainRoute={provider:"DSH中的实际provider标识",model:"主模型名"} 显式绑定同一配置的 pricing。可增加 baseURL 作为精确匹配条件。匹配多个价表时拒绝选价，不猜其中之一。通过官方适配器接到第三方时必须附明确第三方 baseURL，不能覆盖官方 origin 价表。缺乏可确认路由身份或历史价表的请求继续标为未知。
7. 占比=prediction/(main+prediction)，相同线程/币种/覆盖区间。金额有上界时使用≤及占比范围，不显示虚假精确百分比。旧历史缺价与安装后完整统计继续区分；不改写旧原始收据。

## 余额 watchdog
仅真实主线程或 Prediction 的 QUOTA/insufficient_quota/明确余额不足响应才挂起自动预测并启动监测。普通429限流、401鉴权、400上下文错误不会误启动。
- 监测按逻辑事件、返回应用触发，同账户合并在途查询；不按秒轮询。
- 手动“检查余额”只是一次读；查到零不能自行启动监测。
- 查到可用余额，或同路由一次真实正常模型请求成功，立即停止监测；再次明确额度拒绝才重新启动。
- 只有官方 DeepSeek origin 调用已知 /user/balance。第三方无标准余额 API，不猜 endpoint，不向未知域名送密钥，不调用收费模型探余额。处于挂起状态时允许用户主动重试，真实请求成功后恢复。
- 手动请求绕过的是余额暂停；价格缺失、旧请求费用待核对、上下文过期等独立校验仍保留。
- 自动恢复前重新核对线程、配置、轮次、用户发送 epoch、输入框草稿和源映射，只补一次有效预测，不能把旧气泡恢复到新一轮。

## 验证范围
本版在远程 Linux 上使用受控 HTTP 响应验证三个协议、错误分类、最终 usage、缓存作用域、费用范围及恢复逻辑。不是对所有第三方服务商实测。没有提供第三方端点和凭据，不伪称真实供应商兼容认证；未为兼容性主动发送收费探测。
官方参数资料：
- https://developers.openai.com/api/reference/resources/chat
- https://developers.openai.com/api/reference/resources/responses/methods/create
- https://platform.claude.com/docs/en/api/messages
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching

### 预测思考默认策略

Beta 2 的预测与校验修复不再继承主会话的 High：能关闭就关闭，不能关闭则使用模型实际支持的最低档。主会话设置不变。原生 DSH 接入读取适配器按最低到最高排列的精确模型能力；若适配器没有公布思考控制，则不发送虚构参数，该路径无法保证服务器关闭思考。

- DeepSeek 原生 Messages：`reasoningEffort: "off"`，实际发送 `thinking: {"type":"disabled"}`。DeepSeek 官方 Responses 使用 `reasoning.effort: "none"`，Chat 使用 `thinking.type: "disabled"`。省略参数不等于关闭。
- OpenAI Responses／Chat：按模型选择 none／minimal／最低有效档。例如 GPT-5.1／5.5 为 none，GPT-5 为 minimal，GPT-6 Astra／6.1 Sol 为 low，GPT-5.2 Pro 为 medium，GPT-5 Pro 仅支持 high，后者无法强制关闭。
- Anthropic：支持关闭的型号使用 disabled；必须思考的型号使用 adaptive + low。Sonnet 5.5 使用 between_tools + low，不能声称完全零思考。不用旧版 budget_tokens 冒充关闭思考。

第三方模型别名需要在配置文件声明实际能力，例如 Responses／Chat：`"reasoningControl":{"efforts":["none","low","high"]}`；Messages：`"reasoningControl":{"thinkingModes":["disabled","adaptive"],"efforts":["low","high"]}`。明确配置 `capabilities.reasoning:false` 表示该路由不接受思考控制，因此不发送这些字段。未知能力在本地拦截，不做收费探测，也不自动换协议。错误的能力声明仍可能被服务商拒绝。

思考配置属于请求条件。第一次从 High 切换到关闭／最低档可能损失父请求的缓存命中；之后稳定复用预测请求可建立自己的缓存，以实际 usage 为准。Beta 2 的本地结果缓存与旧 High 预测隔离。

核对日期 2026-11-17：[DeepSeek](https://api-docs.deepseek.com/guides/thinking_mode)、[OpenAI](https://developers.openai.com/api/docs/guides/reasoning)、[Anthropic](https://platform.claude.com/docs/en/build-with-claude/thinking)。


Beta 3：在设置 → 下一条消息预测 → 后端与缓存中可修改“预测思考策略”。默认“关闭／最低”；选择“按后端配置”并保存后，使用父请求或所选后端配置文件的思考参数。修复请求沿用该策略。切换配置不会自动为当前轮再次付费生成；如需重做，手动触发。
