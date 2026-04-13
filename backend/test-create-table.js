import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Tentar várias configurações
const configs = [
  {
    name: 'Config 1: SSL desabilitado',
    config: {
      host: 'viaduct.proxy.rlwy.net',
      port: 54709,
      user: 'postgres',
      password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
      database: 'railway',
      ssl: false,
      connectionTimeoutMillis: 30000,
    }
  },
  {
    name: 'Config 2: SSL com rejectUnauthorized false',
    config: {
      host: 'viaduct.proxy.rlwy.net',
      port: 54709,
      user: 'postgres',
      password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
      database: 'railway',
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 30000,
    }
  },
  {
    name: 'Config 3: String de conexão simples',
    config: {
      connectionString: 'postgresql://postgres:ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo@viaduct.proxy.rlwy.net:54709/railway'
    }
  }
];

async function testCreateTable(configObj) {
  const client = new Client(configObj.config);
  
  try {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔌 ${configObj.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    console.log('⏳ Conectando...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    // Testar query simples
    console.log('⏳ Testando query SELECT...');
    const testQuery = await client.query('SELECT NOW() as now, version() as version');
    console.log('✅ Query executada:', testQuery.rows[0].now);
    console.log('📊 Versão PostgreSQL:', testQuery.rows[0].version.substring(0, 50) + '...');
    
    // Criar tabela de teste
    console.log('⏳ Criando tabela de teste...');
    await client.query(`
      DROP TABLE IF EXISTS teste_conexao;
    `);
    
    await client.query(`
      CREATE TABLE teste_conexao (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela "teste_conexao" criada!');
    
    // Inserir dados de teste
    console.log('⏳ Inserindo dados de teste...');
    await client.query(`
      INSERT INTO teste_conexao (nome) 
      VALUES ('Teste 1'), ('Teste 2'), ('Teste 3');
    `);
    console.log('✅ Dados inseridos!');
    
    // Ler dados
    console.log('⏳ Lendo dados...');
    const result = await client.query('SELECT * FROM teste_conexao ORDER BY id');
    console.log('✅ Dados encontrados:');
    result.rows.forEach(row => {
      console.log(`   📝 ID: ${row.id} | Nome: ${row.nome} | Criado em: ${row.created_at}`);
    });
    
    console.log('\n🎉 SUCESSO TOTAL! Banco funcionando perfeitamente!');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    await client.end();
    return true;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('🔍 Código:', error.code);
    console.error('🔍 Detalhes:', error.errno);
    try { await client.end(); } catch {}
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 INICIANDO TESTES DE CONEXÃO COM RAILWAY\n');
  
  for (const config of configs) {
    const success = await testCreateTable(config);
    if (success) {
      console.log('✅ Encontramos uma configuração que funciona!');
      break;
    }
  }
  
  console.log('\n✅ Testes concluídos!');
}

runAllTests().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
