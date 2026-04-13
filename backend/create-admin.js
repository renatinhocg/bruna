import { PrismaClient } from './src/generated/prisma/client.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔄 Criando usuário admin master...');

    const senhaHash = await bcrypt.hash('renatinhocg', 10);

    const admin = await prisma.usuario.create({
      data: {
        nome: 'Renato Admin',
        email: 'renatinhocg@gmail.com',
        senha_hash: senhaHash,
        telefone: '00000000000',
        tipo: 'admin',
        status: 'ativo',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Senha: renatinhocg');
    console.log('👤 Tipo:', admin.tipo);
    console.log('');
    console.log('🎉 Agora você pode fazer login no admin em http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
