-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PLANEJADO', 'EM_DESENVOLVIMENTO', 'HOMOLOGACAO', 'PRODUCAO');

-- CreateEnum
CREATE TYPE "public"."TaskPrioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- AlterTable
ALTER TABLE "public"."agendamentos" ADD COLUMN     "anexos" TEXT,
ADD COLUMN     "avaliacao_progresso" INTEGER,
ADD COLUMN     "objetivos_alcancados" TEXT,
ADD COLUMN     "observacoes_profissional" TEXT,
ADD COLUMN     "pontos_atencao" TEXT,
ADD COLUMN     "pontos_positivos" TEXT,
ADD COLUMN     "proxima_sessao_sugerida" TIMESTAMP(3),
ADD COLUMN     "proximos_passos" TEXT,
ADD COLUMN     "recomendacoes" TEXT,
ADD COLUMN     "resumo_sessao" TEXT,
ADD COLUMN     "visivel_cliente" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."projetos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contatos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "mensagem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'novo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."questoes_disc" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "instrucao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questoes_disc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."opcoes_disc" (
    "id" SERIAL NOT NULL,
    "questao_id" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "fator" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opcoes_disc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."testes_disc" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "autorizado" BOOLEAN NOT NULL DEFAULT true,
    "pontuacao_d" INTEGER NOT NULL DEFAULT 0,
    "pontuacao_i" INTEGER NOT NULL DEFAULT 0,
    "pontuacao_s" INTEGER NOT NULL DEFAULT 0,
    "pontuacao_c" INTEGER NOT NULL DEFAULT 0,
    "perfil_primario" TEXT,
    "perfil_secundario" TEXT,
    "percentual_d" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentual_i" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentual_s" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentual_c" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estilo_combinado" TEXT,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testes_disc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."respostas_disc" (
    "id" SERIAL NOT NULL,
    "teste_id" INTEGER NOT NULL,
    "questao_id" INTEGER NOT NULL,
    "opcao_mais_id" INTEGER NOT NULL,
    "opcao_menos_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_disc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PLANEJADO',
    "prioridade" "public"."TaskPrioridade" NOT NULL DEFAULT 'MEDIA',
    "data_inicio" TIMESTAMP(3),
    "data_prevista" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "responsavel" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questoes_disc_numero_key" ON "public"."questoes_disc"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_disc_teste_id_questao_id_key" ON "public"."respostas_disc"("teste_id", "questao_id");

-- AddForeignKey
ALTER TABLE "public"."opcoes_disc" ADD CONSTRAINT "opcoes_disc_questao_id_fkey" FOREIGN KEY ("questao_id") REFERENCES "public"."questoes_disc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."testes_disc" ADD CONSTRAINT "testes_disc_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_disc" ADD CONSTRAINT "respostas_disc_teste_id_fkey" FOREIGN KEY ("teste_id") REFERENCES "public"."testes_disc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_disc" ADD CONSTRAINT "respostas_disc_questao_id_fkey" FOREIGN KEY ("questao_id") REFERENCES "public"."questoes_disc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_disc" ADD CONSTRAINT "respostas_disc_opcao_mais_id_fkey" FOREIGN KEY ("opcao_mais_id") REFERENCES "public"."opcoes_disc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_disc" ADD CONSTRAINT "respostas_disc_opcao_menos_id_fkey" FOREIGN KEY ("opcao_menos_id") REFERENCES "public"."opcoes_disc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
