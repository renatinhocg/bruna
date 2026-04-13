import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔌 Tentando conectar ao PostgreSQL...');
    console.log('URL:', process.env.DATABASE_URL);
    
    await client.connect();
    console.log('✅ Conexão bem-sucedida!');
    
    const res = await client.query('SELECT NOW() as now');
    console.log('✅ Query de teste:', res.rows[0]);
    
    const dbInfo = await client.query('SELECT version()');
    console.log('✅ Versão do PostgreSQL:', dbInfo.rows[0].version);
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await client.end();
  }
}

testConnection();
