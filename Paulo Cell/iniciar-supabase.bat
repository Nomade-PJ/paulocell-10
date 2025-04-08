@echo off
echo ===================================================
echo        INICIALIZAÇÃO DO SUPABASE - PAULO CELL
echo ===================================================
echo.

REM Verificar se o Docker está instalado
docker --version > nul 2>&1
if %errorlevel% neq 0 (
  echo [ERRO] Docker não encontrado. Por favor, instale o Docker Desktop:
  echo https://www.docker.com/products/docker-desktop
  echo.
  pause
  exit /b 1
)

REM Verificar se o Supabase CLI está instalado
supabase --version > nul 2>&1
if %errorlevel% neq 0 (
  echo [ERRO] Supabase CLI não encontrado. Instalando...
  echo.
  
  REM Verificar se o npm está instalado
  npm --version > nul 2>&1
  if %errorlevel% neq 0 (
    echo [ERRO] NPM não encontrado. Por favor, instale o Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
  )
  
  npm install -g supabase
  
  REM Verificar se a instalação foi bem-sucedida
  supabase --version > nul 2>&1
  if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar o Supabase CLI.
    echo.
    pause
    exit /b 1
  }
  
  echo [OK] Supabase CLI instalado com sucesso.
  echo.
)

echo Iniciando o Supabase localmente...
echo.

REM Verificar se o Supabase já foi inicializado
if not exist supabase (
  echo Inicializando o projeto Supabase pela primeira vez...
  supabase init
  
  echo.
  echo Configurando o projeto Supabase...
  
  REM Copiar o esquema SQL para a pasta de migrations
  if not exist supabase\migrations mkdir supabase\migrations
  copy sql\supabase-schema.sql supabase\migrations\00000000000000_initial_schema.sql
)

REM Iniciar o Supabase
supabase start

echo.
echo ===================================================
echo Supabase iniciado com sucesso!
echo.
echo Dashboard: http://localhost:54323
echo API: http://localhost:54321
echo.
echo Credenciais de banco de dados:
echo Host: localhost
echo Porta: 54322
echo Usuário: postgres
echo Senha: postgres
echo Banco: postgres
echo ===================================================
echo.

REM Iniciar a aplicação em modo de desenvolvimento
echo Iniciando a aplicação em modo de desenvolvimento...
echo.
npm run dev 