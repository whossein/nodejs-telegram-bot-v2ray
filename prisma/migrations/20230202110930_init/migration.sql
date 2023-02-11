-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "nationalCode" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Normal',
    "walletBallance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_nationalCode_key" ON "User"("nationalCode");
