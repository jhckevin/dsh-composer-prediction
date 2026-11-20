$ErrorActionPreference='Stop'
$repository=Split-Path $PSScriptRoot -Parent
$folder=Join-Path ([IO.Path]::GetTempPath()) ('dsh-installer-test-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $folder | Out-Null
try{
 Copy-Item -LiteralPath (Join-Path $repository 'windows/install.ps1') -Destination $folder
 $fake=Join-Path $folder 'dsh.cmd';Set-Content -LiteralPath $fake -Value '@exit /b 99' -Encoding ascii
 $archive=Join-Path $folder 'test.tgz';[IO.File]::WriteAllText($archive,'fixture archive, not an installable package')
 $hash=(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
 @{name='@jhckevin/dsh-composer-prediction';version='0.8.0-beta.4';file='test.tgz';sha256=$hash} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $folder 'package-manifest.json') -Encoding utf8
 $script=Join-Path $folder 'install.ps1'
 $errors=$null;[Management.Automation.Language.Parser]::ParseFile($script,[ref]$null,[ref]$errors) | Out-Null
 if($errors.Count){throw 'PowerShell syntax check failed'}
 $online=(& $script -DshCliPath $fake -DryRun) | ConvertFrom-Json
 if($online.arguments -notcontains '@jhckevin/dsh-composer-prediction@0.8.0-beta.4'){throw 'Online package mismatch'}
 $offline=(& $script -DshCliPath $fake -Offline -DryRun) | ConvertFrom-Json
 if($offline.arguments -notcontains $archive){throw 'Offline package mismatch'}
 [IO.File]::WriteAllText($archive,'corrupt')
 $caught=$false;try{& $script -DshCliPath $fake -Offline -DryRun}catch{$caught=$true};if(-not $caught){throw 'Corrupt archive was accepted'}
 $caught=$false;try{& $script -DshCliPath $fake -Version 'latest;echo bad' -DryRun}catch{$caught=$true};if(-not $caught){throw 'Invalid version was accepted'}
 Write-Output 'Windows installer: 5 checks passed; no DSH installation performed'
}finally{
 $resolved=[IO.Path]::GetFullPath($folder);$temp=[IO.Path]::GetFullPath([IO.Path]::GetTempPath())
 if(-not $resolved.StartsWith($temp,[StringComparison]::OrdinalIgnoreCase)){throw 'Refusing cleanup outside the test temp directory'}
 Remove-Item -LiteralPath $folder -Recurse -Force
}

$cmdFolder=Join-Path ([IO.Path]::GetTempPath()) ('dsh-cmd-test-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $cmdFolder | Out-Null
try{
 $localApp=Join-Path $cmdFolder 'AppData'
 $cliDirectory=Join-Path $localApp 'Programs/DeepSeek Harness/resources/runtime/cli/bin'
 New-Item -ItemType Directory -Path $cliDirectory -Force | Out-Null
 $logFile=Join-Path $cmdFolder 'arguments.txt'
 @'
@echo off
> "%DSH_INSTALLER_TEST_LOG%" echo %*
exit /b 0
'@ | Set-Content -LiteralPath (Join-Path $cliDirectory 'dsh.cmd') -Encoding ascii
 $launcher=Join-Path $cmdFolder 'install.cmd'
 Copy-Item -LiteralPath (Join-Path $repository 'windows/install.cmd') -Destination $launcher
 $info=New-Object Diagnostics.ProcessStartInfo
 $info.FileName=$env:ComSpec
 $info.Arguments='/d /c ""'+$launcher+'""'
 $info.UseShellExecute=$false
 $info.CreateNoWindow=$true
 $info.RedirectStandardOutput=$true
 $info.RedirectStandardError=$true
 $info.EnvironmentVariables['LOCALAPPDATA']=$localApp
 $info.EnvironmentVariables['DSH_INSTALLER_TEST_LOG']=$logFile
 $process=[Diagnostics.Process]::Start($info)
 if(-not $process.WaitForExit(15000)){$process.Kill();throw 'Batch launcher timed out'}
 if($process.ExitCode -ne 0){throw ('Batch launcher failed: '+$process.StandardError.ReadToEnd())}
 $arguments=Get-Content -LiteralPath $logFile -Raw
 if(-not $arguments.Contains('@jhckevin/dsh-composer-prediction@0.8.0-beta.4') -or -not $arguments.Contains('--profile desktop')){throw 'Batch launcher argument mismatch'}
 Write-Output 'Default Windows launcher: 1 check passed with a fake CLI; no policy change or DSH install'
}finally{
 $resolved=[IO.Path]::GetFullPath($cmdFolder);$temp=[IO.Path]::GetFullPath([IO.Path]::GetTempPath())
 if(-not $resolved.StartsWith($temp,[StringComparison]::OrdinalIgnoreCase)){throw 'Refusing cleanup outside the test temp directory'}
 Remove-Item -LiteralPath $cmdFolder -Recurse -Force
}
