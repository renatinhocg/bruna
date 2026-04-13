-- CreateTable
CREATE TABLE "public"."permissoes_testes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo_teste" TEXT NOT NULL,
    "liberado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissoes_testes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissoes_testes_usuario_id_tipo_teste_key" ON "public"."permissoes_testes"("usuario_id", "tipo_teste");

-- AddForeignKey
ALTER TABLE "public"."permissoes_testes" ADD CONSTRAINT "permissoes_testes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
