// Script para otimizar todas as rotas
import fs from 'fs';
import path from 'path';

const routesDir = './src/routes';
const files = [
  'agendamentos.js',
  'auth.js',
  'configuracoes.js',
  'perguntas.js',
  'possibilidades.js',
  'relatorios.js',
  'resultados-inteligencias.js',
  'resultados.js',
  'testes-inteligencia.js',
  'testes.js',
  'upload.js',
  'usuarios.js'
];

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Substituir import do PrismaClient
  content = content.replace(
    /import { PrismaClient } from ['"]\.\.\/generated\/prisma\/index\.js['"];?\n/g,
    "import prisma from '../config/prisma.js';\n"
  );
  
  // Remover criação de instância
  content = content.replace(
    /const prisma = new PrismaClient\(\);?\n/g,
    ''
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Otimizado: ${file}`);
});

console.log('\n🎉 Todas as rotas otimizadas!');
