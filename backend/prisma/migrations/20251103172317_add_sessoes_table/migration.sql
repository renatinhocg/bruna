-- CreateTable
CREATE TABLE "public"."sessoes" (
    "id" SERIAL NOT NULL,
    "agendamento_id" INTEGER NOT NULL,
    "registro_sessao" TEXT NOT NULL,
    "tarefa_casa" TEXT,
    "observacoes" TEXT,
    "documentos" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."sessoes" ADD CONSTRAINT "sessoes_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "public"."agendamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
