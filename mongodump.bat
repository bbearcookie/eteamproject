set CURPATH=%cd%

cd utils\mongodb-database-tools-windows-x86_64-100.5.1\bin
mongodump --uri mongodb://127.0.0.1:27017 --db eteamDB --out %CURPATH%\eteamDBdump_%RANDOM%
pause