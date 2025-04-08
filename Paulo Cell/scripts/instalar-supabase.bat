@echo off
echo ===================================================
echo        INSTALACAO DO SUPABASE CLI - PAULO CELL
echo ===================================================
echo.

REM Verificar se o npm está instalado
npm --version > nul 2>&1
if %errorlevel% neq 0 (
  echo [ERRO] NPM nao encontrado. Por favor, instale o Node.js:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo Instalando o Supabase CLI...
echo.

npm install -g supabase

REM Verificar se a instalação foi bem-sucedida
supabase --version > nul 2>&1
if %errorlevel% neq 0 (
  echo [ERRO] Falha ao instalar o Supabase CLI.
  echo.
  pause
  exit /b 1
)

echo [OK] Supabase CLI instalado com sucesso!
echo.

REM Verificar se o Docker está instalado
docker --version > nul 2>&1
if %errorlevel% neq 0 (
  echo [ALERTA] Docker nao encontrado. O Docker e necessario para executar o Supabase localmente.
  echo Por favor, instale o Docker Desktop:
  echo https://www.docker.com/products/docker-desktop
  echo.
  pause
) else (
  echo [OK] Docker encontrado. O ambiente esta pronto para executar o Supabase.
  
  echo.
  echo Para iniciar o Supabase, execute o script iniciar-supabase.bat
)

echo.
echo ===================================================
echo.
pause 