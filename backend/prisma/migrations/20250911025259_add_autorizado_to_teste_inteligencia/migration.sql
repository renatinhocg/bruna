-- AlterTable
ALTER TABLE "public"."categorias_inteligencia" ALTER COLUMN "caracteristicas_inteligente" DROP NOT NULL,
ALTER COLUMN "caracteristicas_inteligente" DROP DEFAULT,
ALTER COLUMN "carreiras_associadas" DROP NOT NULL,
ALTER COLUMN "carreiras_associadas" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."perguntas_inteligencia" ADD COLUMN     "obrigatoria" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'multipla_escolha';

-- AlterTable
ALTER TABLE "public"."possibilidades_resposta" ADD COLUMN     "pergunta_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."testes_inteligencia" ADD COLUMN     "autorizado" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."possibilidades_resposta" ADD CONSTRAINT "possibilidades_resposta_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "public"."perguntas_inteligencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
