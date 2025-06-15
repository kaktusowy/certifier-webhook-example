-- CreateTable
CREATE TABLE "WebhookRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referenceId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookRun_referenceId_key" ON "WebhookRun"("referenceId");
