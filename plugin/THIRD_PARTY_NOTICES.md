# Third-party code
The self-contained native request adapter, input projections, and schema library are compiled from DeepSeek Harness, MIT license, commit e8f7b93a344964de3dca1ace9e72b6e4d6de87cb.
Source: https://github.com/deepseek-ai/deepseek-harness
The original upstream license is retained in licenses/DeepSeek-Harness-LICENSE; LICENSE also includes the plugin author. Bundles retain source maps and applicable license notices.
Includes @deepseek-ai/cordis, cosmokit, schemastery and Zod through the referenced original source dependency graph.
Zod is MIT, Copyright (c) 2020 Colin McDonnell. See retained bundle legal comments.
React is supplied by the DSH browser module table; not included in the distributed client bundle.
No proprietary Codex client bytes or authenticated remote prompt were included.

0.2 adds Tokenizers.js (Apache-2.0), js-tiktoken and base64-js (MIT), and DeepSeek tokenizer data (MIT, Copyright 2023 DeepSeek). License texts are in licenses/.
The matching V4/V4.1 plain-text tokenizer pipelines were compared equal after removing AddedTokens and post-processing; production uses one shared plain pipeline.
