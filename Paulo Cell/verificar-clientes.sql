-- Script para verificar os clientes no banco de dados MySQL
USE paulocell;

-- Contar o número de registros na tabela de clientes
SELECT 'Total de clientes no banco de dados:' AS Informacao, COUNT(*) AS Quantidade FROM customers;

-- Mostrar todos os clientes cadastrados
SELECT id, name, email, phone, address, city, state, postal_code, DATE_FORMAT(FROM_UNIXTIME(created_at/1000), '%d/%m/%Y %H:%i:%s') AS data_criacao
FROM customers
ORDER BY created_at DESC; 