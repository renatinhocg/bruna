import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

// Banco ANTIGO - vamos tentar todas as URLs possíveis
const oldDbConfigs = [
  {
    name: 'URL antiga 1 - viaduct',
    config: {
      host: 'viaduct.proxy.rlwy.net',
      port: 54709,
      user: 'postgres',
      password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
      database: 'railway',
      ssl: false,
      connectionTimeoutMillis: 5000,
    }
  },
  {
    name: 'URL antiga 2 - viaduct SSL',
    config: {
      host: 'viaduct.proxy.rlwy.net',
      port: 54709,
      user: 'postgres',
      password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
      database: 'railway',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    }
  },
  {
    name: 'URL antiga 3 - switchyard',
    config: {
      host: 'switchyard.proxy.rlwy.net',
      port: 49082,
      user: 'postgres',
      password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
      database: 'railway',
      ssl: false,
      connectionTimeoutMillis: 5000,
    }
  },
  {
    name: 'URL antiga 4 - switchyard SSL',
    config: {
      host: 'switchyard.proxy.rlwy.net',
      port: 49082,
      user: 'postgres',
      password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
      database: 'railway',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
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
    console.log('   ✅ Conectado!');
    
    // Listar tabelas
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma_%'
      ORDER BY tablename;
    `);
    
    const tables = tablesResult.rows.map(r => r.tablename);
    console.log(`   📊 Tabelas encontradas: ${tables.length}`);
    
    // Exportar dados de cada tabela
    const allData = {};
    let totalRecords = 0;
    
    for (const tableName of tables) {
      const data = await exportTableData(client, tableName);
      allData[tableName] = data;
      totalRecords += data.length;
      
      if (data.length > 0) {
        console.log(`   📝 ${tableName}: ${data.length} registros`);
      }
    }
    
    await client.end();
    
    if (totalRecords > 0) {
      // Salvar em arquivo JSON
      const filename = `backup-banco-antigo-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(allData, null, 2));
      console.log(`\n   ✅ Dados exportados para: ${filename}`);
      console.log(`   📊 Total de registros: ${totalRecords}`);
      return { success: true, data: allData, totalRecords };
    } else {
      console.log(`   ⚠️  Nenhum dado encontrado nas tabelas`);
      return { success: true, data: allData, totalRecords: 0 };
    }
    
  } catch (error) {
    console.log(`   ❌ Falhou: ${error.message}`);
    try { await client.end(); } catch {}
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 TENTANDO EXPORTAR DADOS DO BANCO ANTIGO\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const config of oldDbConfigs) {
    const result = await tryExportData(config);
    
    if (result.success) {
      if (result.totalRecords > 0) {
        console.log('\n🎉 SUCESSO! Dados exportados!');
        console.log('\n💡 PRÓXIMO PASSO: Vou criar um script para importar no banco novo.');
        return;
      } else {
        console.log('\n⚠️  Banco conectou mas está vazio.');
      }
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ Não foi possível conectar ao banco antigo.');
  console.log('\n💡 ALTERNATIVAS:');
  console.log('   1. Verificar se o banco "Banco_Bruna" ainda existe no Railway');
  console.log('   2. Verificar se você tem um backup/dump SQL');
  console.log('   3. Podemos popular o banco novo com dados de teste');
  console.log('   4. Se tinha poucos dados, pode recriá-los manualmente');
}

main().catch(console.error);
