-- CreateTable
CREATE TABLE "public"."categorias_inteligencia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_inteligencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."perguntas_inteligencia" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perguntas_inteligencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."possibilidades_resposta" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "possibilidades_resposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."respostas_inteligencia" (
    "id" SERIAL NOT NULL,
    "teste_realizado_id" INTEGER NOT NULL,
    "pergunta_id" INTEGER NOT NULL,
    "possibilidade_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_inteligencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."testes_inteligencia" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "nome_usuario" TEXT,
    "email_usuario" TEXT,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "tempo_resposta" INTEGER,
    "pontuacao_total" INTEGER NOT NULL DEFAULT 0,
    "inteligencia_dominante" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testes_inteligencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resultados_inteligencia" (
    "id" SERIAL NOT NULL,
    "teste_id" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "percentual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultados_inteligencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configuracao_teste" (
    "id" SERIAL NOT NULL,
    "teste_ativo" BOOLEAN NOT NULL DEFAULT false,
    "tempo_limite" INTEGER NOT NULL DEFAULT 30,
    "mostrar_progresso" BOOLEAN NOT NULL DEFAULT true,
    "permitir_voltar" BOOLEAN NOT NULL DEFAULT false,
    "randomizar_perguntas" BOOLEAN NOT NULL DEFAULT false,
    "randomizar_opcoes" BOOLEAN NOT NULL DEFAULT false,
    "pontuacao_minima" INTEGER NOT NULL DEFAULT 0,
    "pontuacao_maxima" INTEGER NOT NULL DEFAULT 100,
    "mensagem_inicio" TEXT NOT NULL,
    "mensagem_fim" TEXT NOT NULL,
    "instrucoes" TEXT NOT NULL,
    "tema_cores" TEXT NOT NULL DEFAULT 'azul',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_teste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_inteligencia_nome_key" ON "public"."categorias_inteligencia"("nome");

-- AddForeignKey
ALTER TABLE "public"."perguntas_inteligencia" ADD CONSTRAINT "perguntas_inteligencia_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias_inteligencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_inteligencia" ADD CONSTRAINT "respostas_inteligencia_teste_realizado_id_fkey" FOREIGN KEY ("teste_realizado_id") REFERENCES "public"."testes_inteligencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_inteligencia" ADD CONSTRAINT "respostas_inteligencia_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "public"."perguntas_inteligencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_inteligencia" ADD CONSTRAINT "respostas_inteligencia_possibilidade_id_fkey" FOREIGN KEY ("possibilidade_id") REFERENCES "public"."possibilidades_resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."testes_inteligencia" ADD CONSTRAINT "testes_inteligencia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resultados_inteligencia" ADD CONSTRAINT "resultados_inteligencia_teste_id_fkey" FOREIGN KEY ("teste_id") REFERENCES "public"."testes_inteligencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resultados_inteligencia" ADD CONSTRAINT "resultados_inteligencia_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias_inteligencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
