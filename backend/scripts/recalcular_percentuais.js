// Script para recalcular e atualizar o campo percentual dos resultados de múltiplas inteligências
// Não exclui nenhum dado, apenas corrige o percentual

import { PrismaClient } from '../src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function atualizarPercentuais() {
  const resultados = await prisma.resultadoInteligencia.findMany();
  let atualizados = 0;
  for (const resultado of resultados) {
    // Buscar perguntas ativas da categoria
    const perguntas = await prisma.perguntaInteligencia.findMany({
      where: { categoria_id: resultado.categoria_id, ativo: true },
      include: { possibilidades: true }
    });
    let valorMax = 5;
    if (perguntas.length > 0) {
      valorMax = Math.max(...perguntas.map(p => {
        if (p.possibilidades && p.possibilidades.length > 0) {
          return Math.max(...p.possibilidades.map(poss => poss.valor));
        }
        return 5;
      }));
    }
    const pontuacao_maxima = perguntas.length * valorMax;
    let percentual = 0;
    if (pontuacao_maxima > 0) {
      percentual = (resultado.pontuacao / pontuacao_maxima) * 100;
    }
    percentual = Math.max(0, Math.min(100, Math.round(percentual * 100) / 100));
    if (resultado.percentual !== percentual) {
      await prisma.resultadoInteligencia.update({
        where: { id: resultado.id },
        data: { percentual }
      });
      atualizados++;
      console.log(`Atualizado ID: ${resultado.id} | Categoria: ${resultado.categoria_id} | Pontuação: ${resultado.pontuacao} | Percentual: ${percentual}`);
    }
  }
  console.log(`\nTotal de resultados atualizados: ${atualizados}`);
  process.exit();
}

atualizarPercentuais().catch(e => { console.error(e); process.exit(1); });
