[CmdletBinding()]
param(
 [ValidatePattern('\A[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}\z')][Alias('Profile')][string]$DshProfile='desktop',
 [string]$Version='',
 [string]$DshCliPath='',
 [switch]$Offline,
 [switch]$DryRun
)
$ErrorActionPreference='Stop'
$manifestPath=Join-Path $PSScriptRoot 'package-manifest.json'
if(-not (Test-Path -LiteralPath $manifestPath)){throw 'package-manifest.json is missing. Extract the complete release ZIP.'}
$manifest=Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if($manifest.name -cne '@jhckevin/dsh-composer-prediction'){throw 'Unexpected package identity'}
if(-not $Version){$Version=[string]$manifest.version}
if($Version -notmatch '\A(?:latest|\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\z'){throw 'Invalid version'}
$candidates=@()
if($DshCliPath){$candidates+=([IO.Path]::GetFullPath($DshCliPath))}
else{
 if($env:LOCALAPPDATA){$candidates+=(Join-Path $env:LOCALAPPDATA 'Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd')}
 if($env:ProgramFiles){$candidates+=(Join-Path $env:ProgramFiles 'DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd')}
 $programFilesX86=[Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
 if($programFilesX86){$candidates+=(Join-Path $programFilesX86 'DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd')}
}
$cli=$candidates | Where-Object {Test-Path -LiteralPath $_ -PathType Leaf} | Select-Object -First 1
if(-not $cli){throw 'DSH CLI was not found. Install DeepSeek Harness first, or pass -DshCliPath with its bundled dsh.cmd.'}
$spec='@jhckevin/dsh-composer-prediction@'+$Version
if($Offline){
 if($Version -cne $manifest.version){throw 'Offline mode installs only the bundled version'}
 if([IO.Path]::GetFileName([string]$manifest.file) -cne $manifest.file){throw 'Invalid bundled filename'}
 $package=Join-Path $PSScriptRoot $manifest.file
 if(-not (Test-Path -LiteralPath $package -PathType Leaf)){throw 'Bundled npm archive is missing'}
 $actual=(Get-FileHash -LiteralPath $package -Algorithm SHA256).Hash.ToLowerInvariant()
 if($actual -cne $manifest.sha256){throw 'Bundled npm archive checksum mismatch'}
 if($package -match '[&|<>^%!"\r\n]'){throw 'Move the extracted ZIP to a folder without shell metacharacters for offline installation'}
 $spec=$package
}
$arguments=@('plugin','--profile',$DshProfile,'add',$spec,'--ignore-scripts','--registry=https://registry.npmjs.org/')
if($DryRun){
 [pscustomobject]@{cli=$cli;arguments=$arguments;offline=[bool]$Offline} | ConvertTo-Json -Depth 4
 return
}
Write-Host ('Installing '+$manifest.name+' into DSH profile '+$DshProfile)
& $cli @arguments
if($LASTEXITCODE -ne 0){throw ('DSH installation failed: '+$LASTEXITCODE)}
Write-Host 'Installed. Reload or restart DSH when the host asks.'
if($Offline){Write-Host 'Offline file sources do not provide registry version checks. Use the npm install command later to restore them.'}
