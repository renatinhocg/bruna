import { PrismaClient } from './src/generated/prisma/index.js';

async function testDetailed() {
    console.log('=== TESTE DETALHADO ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'definida' : 'não definida');
    
    if (process.env.DATABASE_URL) {
        console.log('URL do banco:', process.env.DATABASE_URL.substring(0, 50) + '...');
    }

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        log: ['query', 'info', 'warn', 'error'],
    });

    try {
        console.log('\n=== TENTANDO CONECTAR (timeout 30s) ===');
        
        // Teste de conexão com timeout mais longo
        const result = await Promise.race([
            prisma.$connect(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout após 30 segundos')), 30000)
            )
        ]);
        
        console.log('✅ Conectado com sucesso!');
        
        // Teste de query simples
        console.log('\n=== TESTANDO QUERY ===');
        const count = await prisma.usuario.count();
        console.log('Número de usuários:', count);
        
    } catch (error) {
        console.log('❌ Erro:', error.message);
        console.log('Código:', error.code);
        console.log('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
        console.log('\n=== DESCONECTADO ===');
    }
}

testDetailed();