// Script para limpar arquivos desnecessários após o build
// Este script é executado após o build para remover arquivos
// que não são necessários no deploy para o cPanel

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para usar __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('🧹 Iniciando limpeza após o build...');

// Lista de diretórios que serão verificados e limpos
const dirsToClean = [
  // Caches e arquivos temporários
  path.join(rootDir, 'node_modules', '.cache'),
  path.join(rootDir, 'node_modules', '.vite'),
  
  // Arquivos de desenvolvimento no diretório dist
  path.join(distDir, 'assets', '*.map')
];

// Arquivos específicos a serem removidos
const filesToRemove = [
  // Arquivos de ambiente de desenvolvimento
  path.join(rootDir, '.env.development'),
  path.join(rootDir, '.env.local'),
  
  // Arquivos específicos do Vercel
  path.join(rootDir, 'vercel.json'),
  path.join(rootDir, '.vercelignore'),
  path.join(rootDir, 'VERCEL-DEPLOY.md'),
  
  // Arquivos de documentação que não são necessários em produção
  path.join(rootDir, 'DEPLOY-INSTRUCTIONS.md'),
  path.join(rootDir, 'guia-de-instalacao.html'),
  
  // Outros arquivos desnecessários em produção
  path.join(rootDir, '.env.example')
];

// Remover source maps do diretório de assets
function removeSourceMaps(directory) {
  if (!fs.existsSync(directory)) return;
  
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      removeSourceMaps(filePath);
    } else if (file.endsWith('.map')) {
      console.log(`  Removendo source map: ${filePath}`);
      fs.unlinkSync(filePath);
    }
  }
}

// Função para remover um diretório recursivamente
function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  console.log(`  Removendo diretório: ${dirPath}`);
  
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`  ✅ Diretório removido: ${dirPath}`);
  } catch (err) {
    console.error(`  ❌ Erro ao remover diretório ${dirPath}:`, err);
  }
}

// Função para remover um arquivo
function removeFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  console.log(`  Removendo arquivo: ${filePath}`);
  
  try {
    fs.unlinkSync(filePath);
    console.log(`  ✅ Arquivo removido: ${filePath}`);
  } catch (err) {
    console.error(`  ❌ Erro ao remover arquivo ${filePath}:`, err);
  }
}

// Processa diretórios para limpeza
for (const dirPath of dirsToClean) {
  if (dirPath.includes('*')) {
    // Se o caminho contiver um curinga, use a função específica
    const directory = path.dirname(dirPath);
    if (dirPath.endsWith('*.map')) {
      removeSourceMaps(directory);
    }
  } else {
    // Caso contrário, remova o diretório inteiro
    removeDir(dirPath);
  }
}

// Remover arquivos específicos
for (const filePath of filesToRemove) {
  removeFile(filePath);
}

// Otimizar o tamanho do diretório dist
if (fs.existsSync(distDir)) {
  console.log('Otimizando diretório dist...');
  removeSourceMaps(distDir);
}

console.log('✅ Limpeza concluída! O projeto está otimizado para deploy no cPanel.'); 