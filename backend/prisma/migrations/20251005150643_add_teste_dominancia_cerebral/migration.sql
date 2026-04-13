-- CreateTable
CREATE TABLE "public"."questoes_dominancia" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "instrucao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questoes_dominancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."opcoes_dominancia" (
    "id" SERIAL NOT NULL,
    "questao_id" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "quadrante" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opcoes_dominancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."testes_dominancia" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "autorizado" BOOLEAN NOT NULL DEFAULT true,
    "pontuacao_se" INTEGER NOT NULL DEFAULT 0,
    "pontuacao_sd" INTEGER NOT NULL DEFAULT 0,
    "pontuacao_ie" INTEGER NOT NULL DEFAULT 0,
    "pontuacao_id" INTEGER NOT NULL DEFAULT 0,
    "perfil_dominante" TEXT,
    "percentual_se" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentual_sd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentual_ie" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentual_id" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testes_dominancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."respostas_dominancia" (
    "id" SERIAL NOT NULL,
    "teste_id" INTEGER NOT NULL,
    "questao_id" INTEGER NOT NULL,
    "opcao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_dominancia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."opcoes_dominancia" ADD CONSTRAINT "opcoes_dominancia_questao_id_fkey" FOREIGN KEY ("questao_id") REFERENCES "public"."questoes_dominancia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."testes_dominancia" ADD CONSTRAINT "testes_dominancia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_dominancia" ADD CONSTRAINT "respostas_dominancia_teste_id_fkey" FOREIGN KEY ("teste_id") REFERENCES "public"."testes_dominancia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_dominancia" ADD CONSTRAINT "respostas_dominancia_questao_id_fkey" FOREIGN KEY ("questao_id") REFERENCES "public"."questoes_dominancia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_dominancia" ADD CONSTRAINT "respostas_dominancia_opcao_id_fkey" FOREIGN KEY ("opcao_id") REFERENCES "public"."opcoes_dominancia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
