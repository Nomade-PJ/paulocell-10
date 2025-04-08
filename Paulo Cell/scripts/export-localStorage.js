// Script para exportar dados do localStorage para arquivos JSON que serão usados na migração
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Configuração para usar __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório para salvar os dados exportados
const dataDir = path.join(__dirname, 'data');

// Verificar se o diretório de dados existe, se não, criá-lo
if (!fs.existsSync(dataDir)) {
  console.log('Criando diretório de dados...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Interface para leitura da entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para perguntar ao usuário
function pergunta(questao) {
  return new Promise((resolve) => {
    rl.question(questao, (resposta) => resolve(resposta));
  });
}

// Função para salvar dados em arquivo JSON
function salvarDados(dados, nomeArquivo) {
  const caminhoArquivo = path.join(dataDir, nomeArquivo);
  fs.writeFileSync(caminhoArquivo, JSON.stringify(dados, null, 2));
  console.log(`Dados salvos em ${caminhoArquivo}`);
}

// Função principal
async function main() {
  console.log('Exportador de dados do localStorage para arquivos JSON');
  console.log('====================================================');
  console.log('');
  console.log('Este script irá exportar os dados do localStorage para arquivos JSON');
  console.log('que serão usados na migração para o banco de dados MySQL.');
  console.log('');
  console.log('Instruções:');
  console.log('1. Abra o aplicativo Paulo Cell no navegador');
  console.log('2. Abra o Console do navegador (F12 -> Console)');
  console.log('3. Para cada tipo de dado, execute o comando indicado e cole a saída quando solicitado');
  console.log('');
  
  try {
    console.log('Exportando clientes...');
    console.log('Execute no console do navegador: JSON.stringify(JSON.parse(localStorage.getItem("pauloCell_customers") || "[]"))');
    const clientesJson = await pergunta('Cole o resultado aqui e pressione Enter (ou digite "pular" para ignorar): ');
    
    if (clientesJson && clientesJson.toLowerCase() !== 'pular') {
      const clientes = JSON.parse(clientesJson);
      salvarDados(clientes, 'customers.json');
    } else {
      console.log('Exportação de clientes ignorada.');
    }
    
    console.log('\nExportando dispositivos...');
    console.log('Execute no console do navegador: JSON.stringify(JSON.parse(localStorage.getItem("pauloCell_devices") || "[]"))');
    const dispositivosJson = await pergunta('Cole o resultado aqui e pressione Enter (ou digite "pular" para ignorar): ');
    
    if (dispositivosJson && dispositivosJson.toLowerCase() !== 'pular') {
      const dispositivos = JSON.parse(dispositivosJson);
      salvarDados(dispositivos, 'devices.json');
    } else {
      console.log('Exportação de dispositivos ignorada.');
    }
    
    console.log('\nExportando serviços...');
    console.log('Execute no console do navegador: JSON.stringify(JSON.parse(localStorage.getItem("pauloCell_services") || "[]"))');
    const servicosJson = await pergunta('Cole o resultado aqui e pressione Enter (ou digite "pular" para ignorar): ');
    
    if (servicosJson && servicosJson.toLowerCase() !== 'pular') {
      const servicos = JSON.parse(servicosJson);
      salvarDados(servicos, 'services.json');
    } else {
      console.log('Exportação de serviços ignorada.');
    }
    
    console.log('\nExportando inventário...');
    console.log('Execute no console do navegador: JSON.stringify(JSON.parse(localStorage.getItem("pauloCell_inventory") || "[]"))');
    const inventarioJson = await pergunta('Cole o resultado aqui e pressione Enter (ou digite "pular" para ignorar): ');
    
    if (inventarioJson && inventarioJson.toLowerCase() !== 'pular') {
      const inventario = JSON.parse(inventarioJson);
      salvarDados(inventario, 'inventory.json');
    } else {
      console.log('Exportação de inventário ignorada.');
    }
    
    console.log('\nExportando documentos...');
    console.log('Execute no console do navegador: JSON.stringify(JSON.parse(localStorage.getItem("pauloCell_documents") || "[]"))');
    const documentosJson = await pergunta('Cole o resultado aqui e pressione Enter (ou digite "pular" para ignorar): ');
    
    if (documentosJson && documentosJson.toLowerCase() !== 'pular') {
      const documentos = JSON.parse(documentosJson);
      salvarDados(documentos, 'documents.json');
    } else {
      console.log('Exportação de documentos ignorada.');
    }
    
    console.log('\nTodos os dados foram exportados com sucesso!');
    console.log('Agora você pode executar o script de migração para importar estes dados para o MySQL.');
    
  } catch (error) {
    console.error('Erro durante a exportação dos dados:', error);
  } finally {
    rl.close();
  }
}

// Executar a função principal
main(); 