set backend_jar_port=12058
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%backend_jar_port%" ^| find "LISTENING"') do taskkill /f /pid %%a
exit
