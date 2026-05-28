@echo off
cd /d D:\smart-access-landing
"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" commit -m "fix: update real Google OAuth Client ID"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Done!
pause
