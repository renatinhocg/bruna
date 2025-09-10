/*
  Warnings:

  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Usuario";

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "telefone" TEXT,
    "perfil" TEXT,
    "tipo_cliente" TEXT,
    "empresa" TEXT,
    "avatar_url" TEXT,
    "curriculo_url" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."testes" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."perguntas" (
    "id" SERIAL NOT NULL,
    "teste_id" INTEGER NOT NULL,
    "pergunta" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."respostas" (
    "id" SERIAL NOT NULL,
    "pergunta_id" INTEGER NOT NULL,
    "resposta" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resultados_teste" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "teste_id" INTEGER NOT NULL,
    "respostas" JSONB NOT NULL,
    "pontuacao_total" INTEGER NOT NULL DEFAULT 0,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resultados_teste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agendamentos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "duracao_minutos" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "tipo" TEXT NOT NULL DEFAULT 'sessao',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- AddForeignKey
ALTER TABLE "public"."perguntas" ADD CONSTRAINT "perguntas_teste_id_fkey" FOREIGN KEY ("teste_id") REFERENCES "public"."testes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas" ADD CONSTRAINT "respostas_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "public"."perguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resultados_teste" ADD CONSTRAINT "resultados_teste_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resultados_teste" ADD CONSTRAINT "resultados_teste_teste_id_fkey" FOREIGN KEY ("teste_id") REFERENCES "public"."testes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agendamentos" ADD CONSTRAINT "agendamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
