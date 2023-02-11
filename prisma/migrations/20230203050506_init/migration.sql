-- AlterTable
ALTER TABLE "User" ADD COLUMN "deleted" DATETIME;

-- CreateTable
CREATE TABLE "UserOtp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phoneNumber" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isConfirm" BOOLEAN NOT NULL DEFAULT false,
    "expireAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
