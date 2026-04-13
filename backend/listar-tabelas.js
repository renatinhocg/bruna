import pkg from 'pg';
const { Client } = pkg;

const newDb = {
  host: 'tramway.proxy.rlwy.net',
  port: 27035,
  user: 'postgres',
  password: 'RqMJYXDKzKMfYqefYXnmiurwVYknzcGk',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
};

async function listTables() {
  const client = new Client(newDb);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao banco novo!\n');
    
    // Listar todas as tabelas
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    
    console.log(`📊 TABELAS CRIADAS (${tables.rows.length}):\n`);
    
    for (const row of tables.rows) {
      const tableName = row.tablename;
      
      // Contar registros
      const count = await client.query(`SELECT COUNT(*) as total FROM "${tableName}"`);
      
      // Pegar estrutura
      const columns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
        LIMIT 5;
      `, [tableName]);
      
      console.log(`📝 ${tableName}`);
      console.log(`   └─ ${count.rows[0].total} registros`);
      console.log(`   └─ Colunas: ${columns.rows.map(c => c.column_name).join(', ')}...`);
      console.log('');
    }
    
    await client.end();
    
    console.log('\n✅ BANCO CONFIGURADO E PRONTO PARA USO!');
    console.log('\n💡 Agora você pode:');
    console.log('   1. Iniciar o backend: npm run dev');
    console.log('   2. Popular o banco com dados iniciais (categorias, perguntas, etc)');
    console.log('   3. Criar usuários e testar o sistema');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    try { await client.end(); } catch {}
  }
}

listTables();
