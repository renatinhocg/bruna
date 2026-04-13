-- CreateTable
CREATE TABLE "public"."produtos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "preco_original" DECIMAL(10,2),
    "tipo_teste" TEXT,
    "icone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."compras" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "produto_id" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "metodo_pagamento" TEXT,
    "transaction_id" TEXT,
    "payment_url" TEXT,
    "qr_code" TEXT,
    "qr_code_url" TEXT,
    "boleto_url" TEXT,
    "expires_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transacoes" (
    "id" SERIAL NOT NULL,
    "compra_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "gateway_id" TEXT NOT NULL,
    "gateway_status" TEXT,
    "raw_response" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "produtos_slug_key" ON "public"."produtos"("slug");

-- CreateIndex
CREATE INDEX "produtos_slug_idx" ON "public"."produtos"("slug");

-- CreateIndex
CREATE INDEX "produtos_ativo_idx" ON "public"."produtos"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "compras_transaction_id_key" ON "public"."compras"("transaction_id");

-- CreateIndex
CREATE INDEX "compras_usuario_id_idx" ON "public"."compras"("usuario_id");

-- CreateIndex
CREATE INDEX "compras_status_idx" ON "public"."compras"("status");

-- CreateIndex
CREATE INDEX "compras_transaction_id_idx" ON "public"."compras"("transaction_id");

-- CreateIndex
CREATE INDEX "transacoes_compra_id_idx" ON "public"."transacoes"("compra_id");

-- CreateIndex
CREATE INDEX "transacoes_gateway_id_idx" ON "public"."transacoes"("gateway_id");

-- AddForeignKey
ALTER TABLE "public"."compras" ADD CONSTRAINT "compras_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transacoes" ADD CONSTRAINT "transacoes_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "public"."compras"("id") ON DELETE CASCADE ON UPDATE CASCADE;
