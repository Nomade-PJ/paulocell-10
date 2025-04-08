@echo off
echo ===================================================
echo   SISTEMA PAULO CELL - INICIALIZACAO DO SERVIDOR
echo ===================================================
echo.
echo Verificando configuracao do banco de dados...

if not exist .env (
    echo ERRO: Arquivo .env nao encontrado!
    echo Por favor, crie o arquivo .env com as configuracoes do banco de dados.
    echo Consulte o arquivo CONFIGURACAO-BD.md para mais informacoes.
    echo.
    pause
    exit /b 1
)

echo Verificando se o servidor MySQL esta em execucao...
mysql --host=localhost --user=root --password= -e "SELECT 1" > nul 2>&1
if %errorlevel% neq 0 (
    echo AVISO: Nao foi possivel conectar ao servidor MySQL!
    echo O servidor pode nao estar em execucao ou as credenciais podem estar incorretas.
    echo.
    echo O sistema sera iniciado em modo de fallback, usando apenas armazenamento local.
    echo Os dados serao sincronizados quando o banco de dados estiver disponivel.
    echo.
    echo Consulte o arquivo CONFIGURACAO-BD.md para mais informacoes.
    echo.
)

echo.
echo Iniciando o servidor da aplicacao...
echo.
node server.js
echo.

if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar o servidor!
    echo Verifique os logs acima para mais informacoes.
) else (
    echo Servidor encerrado.
)

echo.
pause 