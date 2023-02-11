/*
  Warnings:

  - You are about to alter the column `expireAt` on the `UserOtp` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `BigInt`.

*/
-- CreateTable
CREATE TABLE "UserTokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserOtp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phoneNumber" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isConfirm" BOOLEAN NOT NULL DEFAULT false,
    "expireAt" BIGINT NOT NULL,
    "userId" INTEGER,
    "try" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserOtp" ("code", "createdAt", "expireAt", "id", "isConfirm", "phoneNumber", "updatedAt") SELECT "code", "createdAt", "expireAt", "id", "isConfirm", "phoneNumber", "updatedAt" FROM "UserOtp";
DROP TABLE "UserOtp";
ALTER TABLE "new_UserOtp" RENAME TO "UserOtp";
CREATE UNIQUE INDEX "UserOtp_phoneNumber_key" ON "UserOtp"("phoneNumber");
CREATE UNIQUE INDEX "UserOtp_userId_key" ON "UserOtp"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "UserTokens_userId_key" ON "UserTokens"("userId");
