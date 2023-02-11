/*
  Warnings:

  - You are about to alter the column `expireAt` on the `UserOtp` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `DateTime`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserOtp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phoneNumber" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isConfirm" BOOLEAN NOT NULL DEFAULT false,
    "expireAt" DATETIME NOT NULL,
    "userId" INTEGER,
    "try" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserOtp" ("code", "createdAt", "expireAt", "id", "isConfirm", "phoneNumber", "try", "updatedAt", "userId") SELECT "code", "createdAt", "expireAt", "id", "isConfirm", "phoneNumber", "try", "updatedAt", "userId" FROM "UserOtp";
DROP TABLE "UserOtp";
ALTER TABLE "new_UserOtp" RENAME TO "UserOtp";
CREATE UNIQUE INDEX "UserOtp_userId_key" ON "UserOtp"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
