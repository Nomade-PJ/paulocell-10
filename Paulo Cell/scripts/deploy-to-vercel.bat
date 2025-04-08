@echo off
echo ======================================
echo Ferramenta de Deploy para Vercel
echo ======================================
echo.

REM Verificando se o git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git nao encontrado. Por favor, instale o Git antes de continuar.
    exit /b 1
)

REM Verificando se o npm está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo NPM nao encontrado. Por favor, instale o Node.js antes de continuar.
    exit /b 1
)

REM Verificando se o Vercel CLI está instalado
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Vercel CLI nao encontrado. Instalando...
    call npm install -g vercel
    if %errorlevel% neq 0 (
        echo Falha ao instalar o Vercel CLI. Por favor, tente instalar manualmente.
        exit /b 1
    )
)

echo Construindo o projeto...
call npm run build
if %errorlevel% neq 0 (
    echo Falha na construcao do projeto.
    exit /b 1
)

echo.
echo Implantando na Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo Ocorreu um erro durante a implantacao. Verifique os logs acima.
    exit /b 1
)

echo.
echo ======================================
echo Deploy concluido com sucesso!
echo ======================================
echo Agora configure o backend em Railway, Render ou outro servico
echo conforme as instrucoes no arquivo VERCEL-DEPLOY.md
echo.
pause 