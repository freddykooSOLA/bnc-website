-- CreateTable
CREATE TABLE "TeamFollow" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamFollow_memberId_idx" ON "TeamFollow"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamFollow_memberId_leagueId_teamId_key" ON "TeamFollow"("memberId", "leagueId", "teamId");

-- AddForeignKey
ALTER TABLE "TeamFollow" ADD CONSTRAINT "TeamFollow_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
