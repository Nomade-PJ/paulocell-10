#!/bin/bash
# Script para limpar arquivos temporários e de cache

echo "🧹 Iniciando limpeza de arquivos temporários..."

# Limpar diretório node_modules
if [ -d "node_modules" ]; then
  echo "Limpando cache de npm..."
  npm cache clean --force
fi

# Limpar diretório dist
if [ -d "dist" ]; then
  echo "Removendo diretório dist..."
  rm -rf dist
fi

# Limpar diretório temp
if [ -d "temp" ]; then
  echo "Removendo diretório temp..."
  rm -rf temp
fi

# Limpar arquivos de log
echo "Removendo arquivos de log..."
find . -name "*.log" -type f -delete

# Limpar exports de migração
if [ -d "exports" ]; then
  echo "Removendo exports de migração..."
  rm -rf exports
fi

# Limpar arquivos temporários
echo "Removendo arquivos temporários..."
find . -name "*.tmp" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete

echo "✅ Limpeza concluída!" 