-- CreateTable
CREATE TABLE "public"."links" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icone" TEXT DEFAULT '🔗',
    "descricao" TEXT,
    "cor" TEXT DEFAULT '#1890ff',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "usuario_id" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."click_logs" (
    "id" SERIAL NOT NULL,
    "link_id" INTEGER NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referer" TEXT,
    "pais" TEXT,
    "cidade" TEXT,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "click_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "click_logs_link_id_idx" ON "public"."click_logs"("link_id");

-- CreateIndex
CREATE INDEX "click_logs_clicked_at_idx" ON "public"."click_logs"("clicked_at");

-- AddForeignKey
ALTER TABLE "public"."links" ADD CONSTRAINT "links_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."click_logs" ADD CONSTRAINT "click_logs_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
