-- CreateTable
CREATE TABLE "space" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_meta" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dbTableName" TEXT,
    "baseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" INTEGER NOT NULL DEFAULT 1,
    "computedConfig" JSONB,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "table_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dbFieldName" TEXT NOT NULL,
    "dbFieldType" TEXT NOT NULL,
    "cellValueType" TEXT NOT NULL,
    "tableMetaId" TEXT NOT NULL,
    "options" JSONB,
    "lookupOptions" JSONB,
    "format" JSONB,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isComputed" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "expression" TEXT,
    "computedFieldMeta" JSONB,
    "enrichment" JSONB,
    "source_id" TEXT,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'grid',
    "tableId" TEXT NOT NULL,
    "columnMeta" TEXT,
    "filter" JSONB,
    "sort" JSONB,
    "group" JSONB,
    "options" JSONB,
    "order" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "source_id" TEXT,
    "shareId" TEXT,
    "enableShare" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "orderColumn" TEXT,
    "deletedTime" TIMESTAMP(3),
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_stream" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "isStreaming" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_trigger" (
    "id" TEXT NOT NULL,
    "data_stream_id" TEXT NOT NULL,
    "trigger_schedule_id" TEXT NOT NULL,
    "record_id" INTEGER NOT NULL,
    "trigger_time" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'PENDING',
    "status" TEXT NOT NULL DEFAULT 'active',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "nextRetryTime" TIMESTAMP(3),
    "lastError" TEXT,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedTime" TIMESTAMP(3) NOT NULL,
    "deletedTime" TIMESTAMP(3),

    CONSTRAINT "scheduled_trigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trigger_schedule" (
    "id" TEXT NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "offsetMinutes" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trigger_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "space_status_idx" ON "space"("status");

-- CreateIndex
CREATE INDEX "base_spaceId_idx" ON "base"("spaceId");

-- CreateIndex
CREATE INDEX "base_status_idx" ON "base"("status");

-- CreateIndex
CREATE INDEX "table_meta_baseId_idx" ON "table_meta"("baseId");

-- CreateIndex
CREATE INDEX "table_meta_status_idx" ON "table_meta"("status");

-- CreateIndex
CREATE INDEX "field_tableMetaId_idx" ON "field"("tableMetaId");

-- CreateIndex
CREATE INDEX "field_status_idx" ON "field"("status");

-- CreateIndex
CREATE INDEX "view_tableId_idx" ON "view"("tableId");

-- CreateIndex
CREATE INDEX "view_status_idx" ON "view"("status");

-- CreateIndex
CREATE INDEX "data_stream_tableId_idx" ON "data_stream"("tableId");

-- CreateIndex
CREATE INDEX "data_stream_status_idx" ON "data_stream"("status");

-- CreateIndex
CREATE INDEX "scheduled_trigger_data_stream_id_idx" ON "scheduled_trigger"("data_stream_id");

-- CreateIndex
CREATE INDEX "scheduled_trigger_trigger_schedule_id_idx" ON "scheduled_trigger"("trigger_schedule_id");

-- CreateIndex
CREATE INDEX "scheduled_trigger_status_idx" ON "scheduled_trigger"("status");

-- CreateIndex
CREATE INDEX "scheduled_trigger_state_idx" ON "scheduled_trigger"("state");

-- CreateIndex
CREATE INDEX "trigger_schedule_status_idx" ON "trigger_schedule"("status");

-- AddForeignKey
ALTER TABLE "base" ADD CONSTRAINT "base_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_meta" ADD CONSTRAINT "table_meta_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field" ADD CONSTRAINT "field_tableMetaId_fkey" FOREIGN KEY ("tableMetaId") REFERENCES "table_meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view" ADD CONSTRAINT "view_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "table_meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_stream" ADD CONSTRAINT "data_stream_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "table_meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_trigger" ADD CONSTRAINT "scheduled_trigger_data_stream_id_fkey" FOREIGN KEY ("data_stream_id") REFERENCES "data_stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_trigger" ADD CONSTRAINT "scheduled_trigger_trigger_schedule_id_fkey" FOREIGN KEY ("trigger_schedule_id") REFERENCES "trigger_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
