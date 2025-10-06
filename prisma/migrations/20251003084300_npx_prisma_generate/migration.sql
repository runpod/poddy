-- CreateTable
CREATE TABLE "qa_threads" (
    "thread_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" TEXT,
    "content" TEXT NOT NULL,
    "llm_used" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_threads_pkey" PRIMARY KEY ("thread_id")
);
