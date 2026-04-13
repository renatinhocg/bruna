import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function testWithConfig(config, description) {
  const client = new Client(config);
  
  try {
    console.log(`\n🔌 Testando: ${description}`);
    await client.connect();
    console.log('✅ Conexão bem-sucedida!');
    
    const res = await client.query('SELECT NOW() as now');
    console.log('✅ Query:', res.rows[0]);
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Falhou:', error.message);
    try { await client.end(); } catch {}
    return false;
  }
}

async function runTests() {
  const baseUrl = 'postgresql://postgres:ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo@viaduct.proxy.rlwy.net:54709/railway';
  
  // Teste 1: Sem SSL
  await testWithConfig({
    connectionString: baseUrl,
    ssl: false
  }, 'Sem SSL');
  
  // Teste 2: SSL sem verificação
  await testWithConfig({
    connectionString: baseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  }, 'SSL sem verificação de certificado');
  
  // Teste 3: SSL com verificação
  await testWithConfig({
    connectionString: baseUrl,
    ssl: true
  }, 'SSL com verificação');
  
  // Teste 4: Parâmetros na URL
  await testWithConfig({
    connectionString: baseUrl + '?sslmode=require',
  }, 'SSL via parâmetro sslmode=require');
  
  // Teste 5: Configuração manual
  await testWithConfig({
    host: 'viaduct.proxy.rlwy.net',
    port: 54709,
    user: 'postgres',
    password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
    database: 'railway',
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  }, 'Configuração manual com SSL');
  
  // Teste 6: Sem SSL manual
  await testWithConfig({
    host: 'viaduct.proxy.rlwy.net',
    port: 54709,
    user: 'postgres',
    password: 'ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo',
    database: 'railway',
    ssl: false,
    connectionTimeoutMillis: 10000,
  }, 'Configuração manual sem SSL');
}

runTests().catch(console.error);
