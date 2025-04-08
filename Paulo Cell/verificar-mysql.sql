-- Script para validar que todos os dados estão sendo armazenados no MySQL
USE paulocell;

-- Mostrar informações sobre as tabelas no banco de dados
SHOW TABLES;

-- Contar o número de registros em cada tabela principal
SELECT 'Clientes' AS Tabela, COUNT(*) AS Total FROM customers;
-- SELECT 'Dispositivos' AS Tabela, COUNT(*) AS Total FROM devices;
-- SELECT 'Serviços' AS Tabela, COUNT(*) AS Total FROM services;

-- Examinar alguns registros de clientes
SELECT id, name, email, phone, created_at, updated_at FROM customers LIMIT 5;

-- Verificar operações recentes (últimos registros inseridos)
SELECT 'Últimos clientes adicionados:' AS Info;
SELECT id, name, email, phone, DATE_FORMAT(FROM_UNIXTIME(created_at/1000), '%d/%m/%Y %H:%i:%s') AS data_criacao
FROM customers
ORDER BY created_at DESC
LIMIT 5;

-- Verificar estrutura da tabela de clientes
DESCRIBE customers;

-- Instruções para testar persistência de dados:
-- 1. Execute esse script para verificar o estado atual do banco
-- 2. No aplicativo, crie um novo cliente ou edite um existente
-- 3. Execute esse script novamente para confirmar que as alterações foram salvas no MySQL
-- 4. Reinicie o servidor e verifique se os dados permanecem intactos 