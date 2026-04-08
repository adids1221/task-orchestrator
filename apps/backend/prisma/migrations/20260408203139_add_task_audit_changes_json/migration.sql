-- CreateTable
CREATE TABLE "TaskAuditLog" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'TASK_UPDATED',
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedBy" TEXT NOT NULL,
    "changes" JSONB NOT NULL,

    CONSTRAINT "TaskAuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskAuditLog" ADD CONSTRAINT "TaskAuditLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
