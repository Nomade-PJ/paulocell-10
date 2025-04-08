/**
 * Rotas para gerenciamento de estatísticas
 */
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { getDbConnection } from '../database.js';

const router = express.Router();

// Rota para resetar todas as estatísticas
router.post('/reset-all', async (req, res) => {
  try {
    console.log('[API] Solicitação para resetar todas as estatísticas');
    
    // 1. Conectar ao banco de dados
    const connection = await getDbConnection();
    
    // 2. Resetar estatísticas nas tabelas
    await connection.execute(`
      UPDATE statistics SET 
        data = '{"devices":{"byType":{"tablet":0,"celular":0,"notebook":0,"outros":0},"byStatus":{"bomEstado":0,"problemasLeves":0,"problemasCriticos":0},"byBrand":{"Apple":0,"Samsung":0,"Xiaomi":0,"Motorola":0,"LG":0,"Outros":0}},"services":{"byStatus":{"emAndamento":0,"aguardandoPecas":0,"concluidos":0,"cancelados":0,"entregues":0},"byType":{"trocaTela":0,"trocaBateria":0,"reparoPlaca":0,"conectorCarga":0,"outros":0},"avgTime":{"trocaTela":0,"trocaBateria":0,"reparoPlaca":0,"conectorCarga":0,"diagnostico":0}},"customers":{"byType":{"pessoaFisica":0,"empresa":0},"distribution":{"tela":0,"bateria":0,"acessorio":0,"placa":0,"outro":0},"monthly":{"jan":0,"fev":0,"mar":0,"abr":0,"mai":0,"jun":0,"jul":0,"ago":0,"set":0,"out":0,"nov":0,"dez":0}},"sales":{"monthly":{"services":[0,0,0,0,0,0,0,0,0,0,0,0],"parts":[0,0,0,0,0,0,0,0,0,0,0,0],"total":[0,0,0,0,0,0,0,0,0,0,0,0]},"total":{"value":0,"growth":0},"services":{"value":0,"growth":0},"parts":{"value":0,"growth":0}}}'
      WHERE type = 'core_statistics'
    `);
    
    await connection.execute(`
      UPDATE statistics SET 
        data = '{}' 
      WHERE type = 'visual_statistics'
    `);
    
    await connection.execute(`
      UPDATE statistics SET
        data = '{"lastReset":"${new Date().toISOString()}","flags":{"dataReset":true}}'
      WHERE type = 'statistics_metadata'
    `);
    
    // 3. Enviar flag para clientes indicando que estatísticas foram resetadas
    // Essa flag será usada pelo cliente para limpar seu localStorage
    const resetNotification = {
      success: true,
      message: 'Todas as estatísticas foram resetadas com sucesso',
      metadata: {
        resetTime: new Date().toISOString(),
        resetType: 'all',
      }
    };
    
    // Fechar conexão
    await connection.end();
    
    res.status(200).json(resetNotification);
  } catch (error) {
    console.error('[API] Erro ao resetar estatísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao resetar estatísticas',
      details: error.message
    });
  }
});

// Rota para resetar apenas estatísticas visuais
router.post('/reset-visual', async (req, res) => {
  try {
    console.log('[API] Solicitação para resetar estatísticas visuais');
    
    // 1. Conectar ao banco de dados
    const connection = await getDbConnection();
    
    // 2. Resetar apenas estatísticas visuais
    await connection.execute(`
      UPDATE statistics SET 
        data = '{}' 
      WHERE type = 'visual_statistics'
    `);
    
    await connection.execute(`
      UPDATE statistics SET
        data = JSON_SET(data, '$.lastVisualReset', '${new Date().toISOString()}')
      WHERE type = 'statistics_metadata'
    `);
    
    // 3. Enviar resposta ao cliente
    const resetNotification = {
      success: true,
      message: 'Estatísticas visuais resetadas com sucesso',
      metadata: {
        resetTime: new Date().toISOString(),
        resetType: 'visual',
      }
    };
    
    // Fechar conexão
    await connection.end();
    
    res.status(200).json(resetNotification);
  } catch (error) {
    console.error('[API] Erro ao resetar estatísticas visuais:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao resetar estatísticas visuais',
      details: error.message
    });
  }
});

// Rota para obter todas as estatísticas
router.get('/', async (req, res) => {
  try {
    // Conectar ao banco de dados
    const connection = await getDbConnection();
    
    // Obter estatísticas
    const [rows] = await connection.execute('SELECT * FROM statistics');
    
    // Organizar dados
    const statistics = {
      core: {},
      visual: {},
      metadata: {}
    };
    
    // Processar resultados
    rows.forEach(row => {
      try {
        const data = JSON.parse(row.data);
        
        if (row.type === 'core_statistics') {
          statistics.core = data;
        } else if (row.type === 'visual_statistics') {
          statistics.visual = data;
        } else if (row.type === 'statistics_metadata') {
          statistics.metadata = data;
        }
      } catch (parseError) {
        console.error(`Erro ao analisar dados de estatísticas: ${parseError.message}`);
      }
    });
    
    // Fechar conexão
    await connection.end();
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('[API] Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao obter estatísticas',
      details: error.message
    });
  }
});

export default router; 