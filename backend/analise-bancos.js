import pkg from 'pg';
const { Client } = pkg;

// Banco ANTIGO (Banco_Bruna)
const oldDb = {
  host: 'viaduct.proxy.rlwy.net',
  port: 54709,
  user: 'postgres',
  password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
};

// Banco NOVO (postgres-production)
const newDb = {
  host: 'tramway.proxy.rlwy.net',
  port: 27035,
  user: 'postgres',
  password: 'RqMJYXDKzKMfYqefYXnmiurwVYknzcGk',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
};

async function getTableList(client) {
  const result = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);
  return result.rows.map(row => row.tablename);
}

async function getTableData(client, tableName) {
  const result = await client.query(`SELECT * FROM "${tableName}"`);
  return result.rows;
}

async function getTableSchema(client, tableName) {
  const result = await client.query(`
    SELECT 
      column_name,
      data_type,
      character_maximum_length,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position;
  `, [tableName]);
  return result.rows;
}

async function analyzeDatabase() {
  console.log('🔌 Conectando ao banco ANTIGO...');
  const oldClient = new Client(oldDb);
  
  try {
    await oldClient.connect();
    console.log('✅ Banco ANTIGO conectado!\n');
    
    const tables = await getTableList(oldClient);
    console.log(`📊 Tabelas encontradas no banco antigo: ${tables.length}\n`);
    
    let totalRecords = 0;
    
    for (const table of tables) {
      const data = await getTableData(oldClient, table);
      const schema = await getTableSchema(oldClient, table);
      totalRecords += data.length;
      console.log(`   📝 ${table}`);
      console.log(`      └─ ${data.length} registros | ${schema.length} colunas`);
      
      // Mostrar algumas colunas
      if (schema.length > 0) {
        const columns = schema.slice(0, 5).map(c => c.column_name).join(', ');
        console.log(`      └─ Colunas: ${columns}${schema.length > 5 ? '...' : ''}`);
      }
      console.log('');
    }
    
    console.log(`\n📊 RESUMO DO BANCO ANTIGO:`);
    console.log(`   • Total de tabelas: ${tables.length}`);
    console.log(`   • Total de registros: ${totalRecords}\n`);
    
    await oldClient.end();
  } catch (error) {
    console.error('❌ Erro no banco ANTIGO:', error.message);
    console.error('   Detalhes:', error.code);
    try { await oldClient.end(); } catch {}
    return false;
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔌 Conectando ao banco NOVO...');
  const newClient = new Client(newDb);
  
  try {
    await newClient.connect();
    console.log('✅ Banco NOVO conectado!\n');
    
    const tables = await getTableList(newClient);
    console.log(`📊 Tabelas encontradas no banco novo: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('   ⚠️  O banco novo JÁ POSSUI tabelas!\n');
      for (const table of tables) {
        const data = await getTableData(newClient, table);
        console.log(`   📝 ${table}: ${data.length} registros`);
      }
    } else {
      console.log('   ✅ Banco novo está vazio e pronto para receber os dados!\n');
    }
    
    await newClient.end();
    return true;
  } catch (error) {
    console.error('❌ Erro no banco NOVO:', error.message);
    try { await newClient.end(); } catch {}
    return false;
  }
}

async function main() {
  console.log('\n🚀 ANÁLISE DOS BANCOS DE DADOS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const success = await analyzeDatabase();
  
  if (success) {
    console.log('\n✅ Análise concluída com sucesso!');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Se quiser migrar os dados, confirme');
    console.log('   2. Vou criar um script de migração automática');
    console.log('   3. Ou podemos usar o Prisma Migrate para recriar a estrutura');
  } else {
    console.log('\n❌ Não foi possível analisar os bancos.');
  }
}

main().catch(console.error);
