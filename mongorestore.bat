set CURPATH=%cd%
set input=
cd utils\mongodb-database-tools-windows-x86_64-100.5.1\bin
set /p input=please type your dumped folder name:
mongorestore %CURPATH%\%input%
pause