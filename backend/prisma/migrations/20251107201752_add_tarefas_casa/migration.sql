-- CreateTable
CREATE TABLE "public"."tarefas_casa" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_casa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tarefas_casa_usuario_id_idx" ON "public"."tarefas_casa"("usuario_id");

-- AddForeignKey
ALTER TABLE "public"."tarefas_casa" ADD CONSTRAINT "tarefas_casa_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
