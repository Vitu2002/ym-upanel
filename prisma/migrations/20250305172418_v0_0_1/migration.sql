-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "token" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api_id" INTEGER,
    "path" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cover" TEXT,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" DATETIME,
    "finished_at" DATETIME,
    "bytes" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api_id" INTEGER,
    "queue_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "chapter" INTEGER NOT NULL,
    "title" TEXT,
    "volume" INTEGER,
    "path" TEXT NOT NULL,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" DATETIME,
    "finished_at" DATETIME,
    "bytes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Chapter_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "Queue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Errors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "queue_id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    CONSTRAINT "Errors_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "Queue" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Errors_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_api_id_key" ON "User"("api_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");
