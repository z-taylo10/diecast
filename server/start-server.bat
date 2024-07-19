@echo off
cd /d %~dp0
echo Starting server with pm2...
pm2 start server.js --name diecast-server
pause
```
</rewritten_file><|eot_id|>
pause