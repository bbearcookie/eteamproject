set CURPATH=%cd%

cd utils\mongodb-win32-x86_64-windows-5.0.3\bin\
mongodump --uri mongodb://127.0.0.1:27017 --db eteamDB --out %CURPATH%\eteamDBdump_%RANDOM%
pause