-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "telefone" TEXT,
    "instagram" TEXT,
    "logo_url" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "marca_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "fotos_json" TEXT NOT NULL DEFAULT '[]',
    "preco_venda" DOUBLE PRECISION,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "custo_tecidos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outros_custos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custo_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "margem_lucro_pct" DOUBLE PRECISION,
    "preco_sugerido" DOUBLE PRECISION,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tecidos" (
    "id" TEXT NOT NULL,
    "marca_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "cor" TEXT,
    "textura" TEXT,
    "foto_url" TEXT,
    "quantidade_estoque" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unidade_medida" TEXT NOT NULL DEFAULT 'metro',
    "valor_por_unidade" DOUBLE PRECISION NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tecidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto_tecidos" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "tecido_id" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "custo_calculado" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "produto_tecidos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nome_key" ON "marcas"("nome");
CREATE UNIQUE INDEX "marcas_email_key" ON "marcas"("email");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_marca_id_fkey"
    FOREIGN KEY ("marca_id") REFERENCES "marcas"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tecidos" ADD CONSTRAINT "tecidos_marca_id_fkey"
    FOREIGN KEY ("marca_id") REFERENCES "marcas"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_tecidos" ADD CONSTRAINT "produto_tecidos_produto_id_fkey"
    FOREIGN KEY ("produto_id") REFERENCES "produtos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_tecidos" ADD CONSTRAINT "produto_tecidos_tecido_id_fkey"
    FOREIGN KEY ("tecido_id") REFERENCES "tecidos"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
