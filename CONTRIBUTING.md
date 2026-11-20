# 开发

在仓库根目录使用 Node.js 24.9+：

```sh
npm ci
npm run setup
npm run build
npm test
npm run verify
```

- 修改运行代码在 plugin/src，测试在 plugin/tests。
- setup 获取固定版本 DSH 源码；下载目录 reference 与测试临时目录 .qa 不提交。
- 所有回归使用模拟网络。不要加入真实 API Key，不在 CI 中调用收费模型。
- 修改默认配置时检查旧结果缓存是否仍可复用；切换设置不得自行再购买一次预测。
- 修改协议时保留上下文与用量边界。不能支持的功能要明确拒绝，不能删除历史后静默降级。
- 截图记录来源、版本和数据性质。演示数据不写成真实账单，不能包含用户聊天或密钥。
- 发布前构建、测试、校验；Windows ZIP 和 npm 包校验值必须一致。

English: use the commands above from the repository root. Source lives in plugin/src, tests in plugin/tests. Keep model traffic mocked, preserve cache compatibility, and document protocol limitations. Do not commit user data or credentials.
