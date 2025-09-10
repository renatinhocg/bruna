import { PrismaClient } from './src/generated/prisma/client.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Verificar se já existe um admin
  const adminExistente = await prisma.usuario.findFirst({
    where: { tipo: 'admin' }
  });

  if (!adminExistente) {
    const senhaHash = await bcrypt.hash('123456', 10);
    
    await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@coaching.com',
        senha_hash: senhaHash,
        telefone: '(11) 99999-9999',
        tipo: 'admin',
        status: 'ativo',
        updated_at: new Date()
      }
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Email: admin@coaching.com');
    console.log('Senha: 123456');
  } else {
    console.log('Admin já existe no banco de dados');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
