-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_projeto_id_fkey";

-- AlterTable
ALTER TABLE "public"."projetos" ADD COLUMN     "cor" TEXT DEFAULT '#3b82f6',
ADD COLUMN     "icone" TEXT DEFAULT '📋',
ADD COLUMN     "template_id" INTEGER,
ADD COLUMN     "tipo" TEXT DEFAULT 'geral',
ADD COLUMN     "usuario_id" INTEGER,
ADD COLUMN     "visualizacao_padrao" TEXT DEFAULT 'lista';

-- AlterTable
ALTER TABLE "public"."tasks" ADD COLUMN     "anexos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ordem" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parent_id" INTEGER,
ADD COLUMN     "progresso" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "responsavel_id" INTEGER,
ADD COLUMN     "tempo_estimado" INTEGER,
ADD COLUMN     "usuario_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."templates_projetos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT DEFAULT '📋',
    "cor" TEXT DEFAULT '#3b82f6',
    "tipo" TEXT NOT NULL DEFAULT 'geral',
    "tasks_template" TEXT,
    "is_publico" BOOLEAN NOT NULL DEFAULT true,
    "usuario_id" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comentarios_tasks" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."anexos_projetos" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT,
    "tamanho" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexos_projetos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."projetos" ADD CONSTRAINT "projetos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projetos" ADD CONSTRAINT "projetos_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates_projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."templates_projetos" ADD CONSTRAINT "templates_projetos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comentarios_tasks" ADD CONSTRAINT "comentarios_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comentarios_tasks" ADD CONSTRAINT "comentarios_tasks_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."anexos_projetos" ADD CONSTRAINT "anexos_projetos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
