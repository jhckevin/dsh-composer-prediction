# Windows installation

[简体中文](../windows.zh-CN.md)

Install DeepSeek Harness first. The ZIP is a plugin installer bundle, not a standalone app. It does not include DSH or install global Node/npm.

## Recommended: npm source

Download the Windows ZIP from this repository's Releases. If Windows marks it as downloaded, verify its source and unblock the ZIP in Properties before extracting. Run install.cmd. The script finds DSH's bundled CLI and installs the release version. Reload/restart DSH when prompted.

It uses the official npm registry with install scripts disabled. It does not change system execution policy or require administrator rights.

```powershell
& "$env:LOCALAPPDATA\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd" plugin --profile desktop add @jhckevin/dsh-composer-prediction@latest --ignore-scripts --registry=https://registry.npmjs.org/
```

For a custom host location/profile:

```powershell
.\install.ps1 -DshCliPath 'D:\Apps\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd' -Profile desktop
```

Use install.ps1 -DryRun to inspect arguments without installing.

## Offline

The ZIP contains the same-version npm tgz and checksum. With DSH and its dependencies already available, use install.ps1 -Offline. It verifies identity, version and SHA-256 before passing the archive to DSH. Corrupt archives are rejected.

File-based installations do not have the same registry update source. Reinstall through the npm command to restore native version checks. For offline installation, use a path without shell metacharacters. Host behavior under every network failure is not claimed as tested.

## Verify / remove

Compare Get-FileHash output to SHA256SUMS.txt in the release. Remove the plugin through DSH's detail page. Keeping ~/.dsh/plugins-data/composer-prediction preserves settings and ledgers; deleting it loses those records.

Report versions and redacted error codes. Do not attach keys, full conversations or accounting databases.
