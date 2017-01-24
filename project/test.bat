@echo off
rmdir /S /Q stage
md stage
call tsc -p .
if errorlevel 1 (
	goto error
)
node correct_source_maps.js
copy manifest.html stage\manifest.html
copy test-package.json stage\package.json
xcopy /E res stage\res\
start node_modules\nw\nwjs\nw.exe stage
goto done

:error
echo "process terminated with errors"

:done