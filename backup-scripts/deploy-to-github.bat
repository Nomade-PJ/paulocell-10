@echo off
setlocal enabledelayedexpansion

:: Script para enviar alterações para o GitHub e atualizar o servidor

:: Cores para melhor visualização no Windows
set "GREEN=[92m"
set "YELLOW=[93m"
set "NC=[0m"

:: Verificar se há alterações para commitar
echo %YELLOW%Verificando alterações no repositório...%NC%
git status

:: Adicionar todas as alterações
echo %YELLOW%Adicionando todas as alterações...%NC%
git add .

:: Solicitar mensagem de commit
echo %YELLOW%Digite a mensagem para o commit:%NC%
set /p commit_message="> "

:: Realizar o commit com a mensagem fornecida
echo %YELLOW%Realizando commit das alterações...%NC%
git commit -m "%commit_message%"

:: Verificar se o repositório remoto está configurado corretamente
echo %YELLOW%Verificando configuração do repositório remoto...%NC%
git remote -v

:: Configurar o repositório remoto se necessário
echo %YELLOW%Configurando repositório remoto para https://github.com/Nomade-PJ/paulocell-10...%NC%
git remote set-url origin https://github.com/Nomade-PJ/paulocell-10 || git remote add origin https://github.com/Nomade-PJ/paulocell-10

:: Enviar para o GitHub
echo %YELLOW%Enviando alterações para o GitHub...%NC%
git push origin master

:: Verificar se o push foi bem-sucedido
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%Alterações enviadas com sucesso para o GitHub!%NC%
    
    :: Perguntar se deseja atualizar o servidor
    echo %YELLOW%Deseja atualizar o servidor na Hostinger? (s/n)%NC%
    set /p update_server="> "
    
    if /i "!update_server!"=="s" (
        :: Exibir instruções para atualizar o servidor
        echo %YELLOW%Para atualizar o servidor na Hostinger, siga estas instruções:%NC%
        echo.
        echo 1. Conecte-se ao servidor via SSH:
        echo    ssh seu_usuario@seu_servidor
        echo.
        echo 2. Navegue até o diretório do projeto:
        echo    cd /var/www/paulocell
        echo.
        echo 3. Atualize o código do repositório:
        echo    git pull
        echo.
        echo 4. Reinicie a aplicação:
        echo    pm2 restart paulocell
        echo.
        echo %GREEN%Após executar esses comandos, o servidor estará atualizado com as últimas alterações!%NC%
    ) else (
        echo %YELLOW%Atualização do servidor cancelada.%NC%
    )
) else (
    echo %YELLOW%Ocorreu um erro ao enviar as alterações para o GitHub. Verifique o erro acima e tente novamente.%NC%
)

echo.
echo %GREEN%Processo concluído!%NC%
pause