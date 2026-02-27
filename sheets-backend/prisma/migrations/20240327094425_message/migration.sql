-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR NOT NULL,
    "createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);
