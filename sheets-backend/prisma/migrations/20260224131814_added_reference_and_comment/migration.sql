-- AlterTable
ALTER TABLE "field" ADD COLUMN     "expression" TEXT,
ADD COLUMN     "lookup_options" JSONB;

-- CreateTable
CREATE TABLE "reference" (
    "id" SERIAL NOT NULL,
    "fromFieldId" INTEGER NOT NULL,
    "toFieldId" INTEGER NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "user_name" VARCHAR(255),
    "user_avatar" TEXT,
    "reactions" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL DEFAULT 'dev-user-001',
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "current_base_id" TEXT,
    "current_table_id" TEXT,
    "current_view_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "action_type" TEXT,
    "action_payload" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedback" VARCHAR(10),

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_approved_contexts" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "base_id" TEXT NOT NULL,
    "table_id" TEXT,
    "approved_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_approved_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reference_fromFieldId_idx" ON "reference"("fromFieldId");

-- CreateIndex
CREATE INDEX "reference_toFieldId_idx" ON "reference"("toFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "reference_fromFieldId_toFieldId_key" ON "reference"("fromFieldId", "toFieldId");

-- CreateIndex
CREATE INDEX "idx_comments_parent" ON "comments"("parent_id");

-- CreateIndex
CREATE INDEX "idx_comments_table_record" ON "comments"("table_id", "record_id");

-- CreateIndex
CREATE INDEX "idx_ai_conversations_user" ON "ai_conversations"("user_id");

-- CreateIndex
CREATE INDEX "idx_ai_messages_conversation" ON "ai_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_ai_approved_contexts_conversation" ON "ai_approved_contexts"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_approved_contexts_conversation_id_base_id_table_id_key" ON "ai_approved_contexts"("conversation_id", "base_id", "table_id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_approved_contexts" ADD CONSTRAINT "ai_approved_contexts_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
