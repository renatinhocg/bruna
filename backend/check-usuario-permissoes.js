import { PrismaClient } from './src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function checkUsuarioPermissoes(usuarioId) {
  try {
    console.log(`\nVerificando permissões para usuário ID: ${usuarioId}\n`);
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, nome: true, email: true }
    });
    
    console.log('Usuário:', usuario);
    
    const permissoes = await prisma.permissaoTeste.findMany({
      where: { usuario_id: usuarioId }
    });
    
    console.log('\nPermissões:', permissoes);
    
    const permissoesMap = {};
    permissoes.forEach(p => {
      permissoesMap[p.tipo_teste] = p.liberado;
    });
    
    console.log('\nMap de permissões:', permissoesMap);
    console.log('\nDISC liberado?', permissoesMap['disc'] === true);
    console.log('Inteligencias liberado?', permissoesMap['inteligencia'] === true);
    console.log('Dominancia liberado?', permissoesMap['dominancia'] === true);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Testar com diferentes IDs
const usuarioId = process.argv[2] || 5;
checkUsuarioPermissoes(parseInt(usuarioId));
