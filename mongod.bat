set CURPATH=%cd%

if not exist %CURPATH%\database (
mkdir %CURPATH%\database
)

cd utils\mongodb-win32-x86_64-windows-5.0.3\bin\
mongod --dbpath %CURPATH%\database
pause