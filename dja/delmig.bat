@echo off
cd C:\Users\etien\Desktop\MyPython\WebSites\Zap\dja
FOR /d /r . %%d IN (migrations) DO @IF EXIST "%%d\0*.py" del "%%d\0*.py"
FOR /d /r . %%d IN (__pycache__) DO @IF EXIST "%%d\*.pyc" del "%%d\*.pyc"
del "db.sqlite3"