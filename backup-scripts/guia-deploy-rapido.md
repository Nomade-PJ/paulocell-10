# Guia Rápido de Deploy para GitHub e Hostinger

## 1. Deploy para GitHub

### Usando Windows

1. Abra o PowerShell como administrador
2. Navegue até a pasta do projeto:
   ```
   cd "C:\Users\Carlos Tutors\Downloads\Paulo Cell"
   ```
3. Execute o script de deploy:
   ```
   .\deploy-to-github.bat
   ```
4. Siga as instruções na tela para inserir a mensagem de commit

### Usando Linux/Mac

1. Abra o Terminal
2. Navegue até a pasta do projeto
3. Execute o script de deploy:
   ```
   chmod +x deploy-to-github.sh
   ./deploy-to-github.sh
   ```
4. Siga as instruções na tela

## 2. Atualizar o Servidor na Hostinger

### Método 1: Via SSH (Recomendado)

1. Conecte-se ao servidor via SSH:
   ```
   ssh seu_usuario@seu_servidor
   ```
2. Navegue até o diretório do projeto:
   ```
   cd /var/www/paulocell
   ```
3. Atualize o código do repositório:
   ```
   git pull
   ```
4. Reinicie a aplicação:
   ```
   pm2 restart paulocell
   ```

### Método 2: Manual (Alternativa)

Se você não tiver acesso SSH configurado, siga estas etapas:

1. Acesse o painel de controle da Hostinger
2. Vá para a seção de Terminal/SSH
3. Execute os seguintes comandos:
   ```
   cd /var/www/paulocell
   git pull
   pm2 restart paulocell
   ```

## Observações Importantes

- O repositório está configurado para: https://github.com/Nomade-PJ/paulocell-10
- Certifique-se de ter as credenciais do GitHub configuradas no seu computador
- Para configurar o acesso SSH à Hostinger, consulte o arquivo `guia-configuracao-ssh-hostinger.md`
- Para detalhes completos sobre a implantação, consulte o arquivo `guia-implementacao-passo-a-passo.md`