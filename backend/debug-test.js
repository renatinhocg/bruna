console.log('=== TESTE DE DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL definida:', !!process.env.DATABASE_URL);
console.log('Primeiros 50 chars da DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

// Teste básico de DNS
import { resolve } from 'dns/promises';

async function testDNS() {
  try {
    console.log('\\n=== TESTE DE DNS ===');
    const ips = await resolve('postgres.railway.internal');
    console.log('✅ DNS resolve postgres.railway.internal:', ips);
    return true;
  } catch (error) {
    console.log('❌ Erro DNS:', error.message);
    return false;
  }
}

testDNS();