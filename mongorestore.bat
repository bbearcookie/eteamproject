set CURPATH=%cd%
set input=
cd utils\mongodb-win32-x86_64-windows-5.0.3\bin\
set /p input=please type your dumped folder name:
mongorestore %CURPATH%\%input%
pause