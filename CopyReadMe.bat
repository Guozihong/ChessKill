@echo off
setlocal enabledelayedexpansion
for /f "delims=" %%i in ('dir /ad /b /s') do (
set n=0
for /f %%j in ('dir "%%i" /a /b /s') do set /a n+=1
if !n!==0 copy README.md "%%i"
)

pause