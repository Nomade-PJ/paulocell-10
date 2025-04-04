@echo off
REM Script para limpar arquivos temporários e de cache no Windows

echo 🧹 Iniciando limpeza de arquivos temporários...

REM Limpar diretório node_modules
if exist "node_modules" (
  echo Limpando cache de npm...
  call npm cache clean --force
)

REM Limpar diretório dist
if exist "dist" (
  echo Removendo diretório dist...
  rmdir /s /q dist
)

REM Limpar diretório temp
if exist "temp" (
  echo Removendo diretório temp...
  rmdir /s /q temp
)

REM Limpar arquivos de log
echo Removendo arquivos de log...
del /s /q *.log

REM Limpar exports de migração
if exist "exports" (
  echo Removendo exports de migração...
  rmdir /s /q exports
)

REM Limpar arquivos temporários
echo Removendo arquivos temporários...
del /s /q *.tmp
del /s /q .DS_Store
del /s /q Thumbs.db

echo ✅ Limpeza concluída! 