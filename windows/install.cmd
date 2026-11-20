@echo off
setlocal
if not "%~1"=="" goto options
set "pluginVersion=0.8.0-beta.4"
set "dshCli=%LOCALAPPDATA%\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd"
if not exist "%dshCli%" set "dshCli=%ProgramFiles%\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd"
if not exist "%dshCli%" set "dshCli=%ProgramFiles(x86)%\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd"
if not exist "%dshCli%" goto missing
call "%dshCli%" plugin --profile desktop add "@jhckevin/dsh-composer-prediction@%pluginVersion%" --ignore-scripts --registry=https://registry.npmjs.org/
set "result=%errorlevel%"
if not "%result%"=="0" pause
exit /b %result%
:missing
echo DeepSeek Harness CLI was not found. Install DSH first or use install.ps1 -DshCliPath with your custom installation.
pause
exit /b 1

:options
echo Use install.ps1 for custom profiles, paths or offline mode.
exit /b 2
