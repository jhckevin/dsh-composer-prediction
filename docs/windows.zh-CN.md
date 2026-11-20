# Windows 安装

[English](en/windows.md)

需要先安装 DeepSeek Harness。本 ZIP 是插件安装辅助包，不是独立客户端，不含 DSH 或全局 Node/npm。

## 推荐：npm 来源

1. 从本仓库 Releases 下载 Windows ZIP。
2. 如果 Windows 标记了下载文件，先在 ZIP 的“属性”中确认来源并“解除锁定”，再解压。
3. 双击 install.cmd。脚本会查找 DSH 自带 CLI，安装 ZIP 对应版本。
4. 按 DSH 的提示重新加载或重启，在插件详情页确认版本。

默认只使用 npm 官方 registry，npm 包的安装生命周期脚本被禁用。不会修改系统执行策略、申请管理员权限或改动你的模型配置。已有数据目录保持不变。

命令行安装同样可用：

```powershell
& "$env:LOCALAPPDATA\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd" plugin --profile desktop add @jhckevin/dsh-composer-prediction@latest --ignore-scripts --registry=https://registry.npmjs.org/
```

自定义 DSH 目录或 profile：

```powershell
.\install.ps1 -DshCliPath 'D:\Apps\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd' -Profile desktop
```

查看将执行的参数，不安装：

```powershell
.\install.ps1 -DryRun
```

## 离线包

ZIP 内附同版本 npm tgz 与 SHA-256。DSH 已安装且其依赖可用时，可运行：

```powershell
.\install.ps1 -Offline
```

脚本先核对包名、版本与 SHA-256，再交给 DSH 安装。损坏包拒绝安装。离线文件安装没有 registry 版本来源；需要原生更新提示时，重新使用上面的 npm 来源命令安装同名包。

如果离线目录含 shell 特殊字符，脚本会拒绝；移到普通目录后重试。这里不把网络不可用时的所有宿主行为都宣称已验证。

## 校验与卸载

Releases 附 SHA256SUMS.txt：

```powershell
Get-FileHash .\DSH-Composer-Prediction-0.8.0-beta.4-Windows.zip -Algorithm SHA256
```

与发布页校验值比较。卸载请在 DSH 的插件详情页操作。保留 ~/.dsh/plugins-data/composer-prediction 可保留配置、黑名单与账本；删除该目录会丢失这些数据。

安装问题请附 Windows / DSH / 插件版本和脱敏错误码，不要附 API Key 或完整账本。
