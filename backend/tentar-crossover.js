import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

// Banco ANTIGO com os novos dados do crossover
const oldDbConfigs = [
  {
    name: 'Crossover proxy - sem SSL',
    config: {
      host: 'crossover.proxy.rlwy.net',
      port: 34069,
      user: 'postgres',
      password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
      database: 'railway',
      ssl: false,
      connectionTimeoutMillis: 10000,
    }
  },
  {
    name: 'Crossover proxy - com SSL',
    config: {
      host: 'crossover.proxy.rlwy.net',
      port: 34069,
      user: 'postgres',
      password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
      database: 'railway',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    }
  }
];

async function exportTableData(client, tableName) {
  try {
    const result = await client.query(`SELECT * FROM "${tableName}"`);
    return result.rows;
  } catch (error) {
    console.error(`   ❌ Erro ao exportar ${tableName}:`, error.message);
    return [];
  }
}

async function tryExportData(configObj) {
  const client = new Client(configObj.config);
  
  try {
    console.log(`\n🔌 Tentando: ${configObj.name}...`);
    await client.connect();
    console.log('   ✅ CONECTADO COM SUCESSO!');
    
    // Testar query simples
    const test = await client.query('SELECT NOW() as now');
    console.log(`   ⏰ Hora do servidor:`, test.rows[0].now);
    
    // Listar tabelas
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma_%'
      ORDER BY tablename;
    `);
    
    const tables = tablesResult.rows.map(r => r.tablename);
    console.log(`   📊 Tabelas encontradas: ${tables.length}\n`);
    
    // Exportar dados de cada tabela
    const allData = {};
    let totalRecords = 0;
    
    for (const tableName of tables) {
      const data = await exportTableData(client, tableName);
      allData[tableName] = data;
      totalRecords += data.length;
      
      if (data.length > 0) {
        console.log(`   ✅ ${tableName}: ${data.length} registros`);
      } else {
        console.log(`   ⚪ ${tableName}: vazia`);
      }
    }
    
    await client.end();
    
    if (totalRecords > 0) {
      // Salvar em arquivo JSON
      const filename = `backup-banco-antigo-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(allData, null, 2));
      console.log(`\n   💾 Dados exportados para: ${filename}`);
      console.log(`   📊 Total de registros: ${totalRecords}`);
      console.log(`\n   🎉 SUCESSO! Backup criado!`);
      return { success: true, data: allData, totalRecords, filename };
    } else {
      console.log(`\n   ⚠️  Banco está vazio (sem dados)`);
      return { success: true, data: allData, totalRecords: 0 };
    }
    
  } catch (error) {
    console.log(`   ❌ Falhou: ${error.message}`);
    if (error.code) {
      console.log(`   🔍 Código do erro: ${error.code}`);
    }
    try { await client.end(); } catch {}
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 ÚLTIMA TENTATIVA - BANCO ANTIGO (CROSSOVER)\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const config of oldDbConfigs) {
    const result = await tryExportData(config);
    
    if (result.success) {
      if (result.totalRecords > 0) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 DADOS RECUPERADOS COM SUCESSO!');
        console.log(`📁 Arquivo: ${result.filename}`);
        console.log('\n💡 PRÓXIMO PASSO:');
        console.log('   Vou criar um script para importar esses dados no banco novo.');
        return result;
      } else if (result.totalRecords === 0) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Banco antigo está vazio - sem dados para migrar');
        console.log('\n💡 Você pode:');
        console.log('   1. Popular o banco novo com dados de teste');
        console.log('   2. Começar do zero');
        return result;
      }
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ Não foi possível conectar ao banco antigo.');
  console.log('\n💡 O banco pode ter sido deletado ou mudou de endereço novamente.');
}

main().catch(console.error);
