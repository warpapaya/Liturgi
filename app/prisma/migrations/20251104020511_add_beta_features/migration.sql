-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('assignment_created', 'assignment_reminder', 'service_updated', 'conflict_detected');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- AlterTable
ALTER TABLE "service_items" ADD COLUMN     "key" TEXT,
ADD COLUMN     "songId" TEXT;

-- AlterTable
ALTER TABLE "service_plans" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "service_templates" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "songs" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "ccliNumber" TEXT,
    "bpm" INTEGER,
    "timeSignature" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arrangements" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "chordChart" TEXT,
    "lyrics" TEXT,
    "audio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arrangements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_availability" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "servicePlanId" TEXT,
    "assignmentId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_templates_orgId_idx" ON "service_templates"("orgId");

-- CreateIndex
CREATE INDEX "service_templates_orgId_isDefault_idx" ON "service_templates"("orgId", "isDefault");

-- CreateIndex
CREATE INDEX "songs_orgId_idx" ON "songs"("orgId");

-- CreateIndex
CREATE INDEX "songs_orgId_title_idx" ON "songs"("orgId", "title");

-- CreateIndex
CREATE INDEX "arrangements_songId_idx" ON "arrangements"("songId");

-- CreateIndex
CREATE INDEX "person_availability_personId_idx" ON "person_availability"("personId");

-- CreateIndex
CREATE INDEX "person_availability_date_idx" ON "person_availability"("date");

-- CreateIndex
CREATE UNIQUE INDEX "person_availability_personId_date_key" ON "person_availability"("personId", "date");

-- CreateIndex
CREATE INDEX "notifications_orgId_idx" ON "notifications"("orgId");

-- CreateIndex
CREATE INDEX "notifications_status_scheduledFor_idx" ON "notifications"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "notifications_servicePlanId_idx" ON "notifications"("servicePlanId");

-- CreateIndex
CREATE INDEX "notifications_assignmentId_idx" ON "notifications"("assignmentId");

-- CreateIndex
CREATE INDEX "service_items_songId_idx" ON "service_items"("songId");

-- CreateIndex
CREATE INDEX "service_plans_templateId_idx" ON "service_plans"("templateId");

-- AddForeignKey
ALTER TABLE "service_plans" ADD CONSTRAINT "service_plans_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "service_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_items" ADD CONSTRAINT "service_items_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_templates" ADD CONSTRAINT "service_templates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrangements" ADD CONSTRAINT "arrangements_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_availability" ADD CONSTRAINT "person_availability_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "service_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "service_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
