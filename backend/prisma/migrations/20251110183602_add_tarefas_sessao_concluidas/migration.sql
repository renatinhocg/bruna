-- CreateTable
CREATE TABLE "public"."tarefas_sessao_concluidas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "sessao_id" INTEGER NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarefas_sessao_concluidas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tarefas_sessao_concluidas_usuario_id_idx" ON "public"."tarefas_sessao_concluidas"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "tarefas_sessao_concluidas_usuario_id_sessao_id_key" ON "public"."tarefas_sessao_concluidas"("usuario_id", "sessao_id");

-- AddForeignKey
ALTER TABLE "public"."tarefas_sessao_concluidas" ADD CONSTRAINT "tarefas_sessao_concluidas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
