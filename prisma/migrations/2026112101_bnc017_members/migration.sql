-- CreateEnum
CREATE TYPE "MemberRoleType" AS ENUM ('FAN', 'PLAYER', 'LEADER');

-- CreateTable
CREATE TABLE "MemberIdentity" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberRole" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "MemberRoleType" NOT NULL,

    CONSTRAINT "MemberRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "jerseyColor1" TEXT NOT NULL,
    "jerseyColor2" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "memberId" TEXT,
    "nameZh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "idPartial" TEXT NOT NULL,
    "staffId" TEXT,
    "jerseyNumber" INTEGER NOT NULL,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'listed',
    "inviteToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "registerBy" TIMESTAMP(3) NOT NULL,
    "rosterBy" TIMESTAMP(3) NOT NULL,
    "feeNote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamEntry" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "leaderNameZh" TEXT NOT NULL,
    "leaderNameEn" TEXT NOT NULL,
    "leaderIdPartial" TEXT NOT NULL,
    "leaderEmail" TEXT NOT NULL,
    "leaderMobile" TEXT NOT NULL,
    "leaderEmergency" TEXT NOT NULL,
    "declarationAccepted" TIMESTAMP(3),
    "declarationBank" TEXT,
    "declarationSigned" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerLink" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "PlayerLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberIdentity_provider_providerAccountId_key" ON "MemberIdentity"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "MemberIdentity_memberId_idx" ON "MemberIdentity"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberRole_memberId_role_key" ON "MemberRole"("memberId", "role");

-- CreateIndex
CREATE INDEX "MemberRole_memberId_idx" ON "MemberRole"("memberId");

-- CreateIndex
CREATE INDEX "Team_createdById_idx" ON "Team"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_teamId_jerseyNumber_key" ON "TeamMembership"("teamId", "jerseyNumber");

-- CreateIndex
CREATE INDEX "TeamMembership_teamId_idx" ON "TeamMembership"("teamId");

-- CreateIndex
CREATE INDEX "TeamMembership_memberId_idx" ON "TeamMembership"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_slug_key" ON "Competition"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TeamEntry_ref_key" ON "TeamEntry"("ref");

-- CreateIndex
CREATE INDEX "TeamEntry_competitionId_idx" ON "TeamEntry"("competitionId");

-- CreateIndex
CREATE INDEX "TeamEntry_teamId_idx" ON "TeamEntry"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerLink_memberId_leagueId_playerId_key" ON "PlayerLink"("memberId", "leagueId", "playerId");

-- CreateIndex
CREATE INDEX "PlayerLink_memberId_idx" ON "PlayerLink"("memberId");

-- AddForeignKey
ALTER TABLE "MemberIdentity" ADD CONSTRAINT "MemberIdentity_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRole" ADD CONSTRAINT "MemberRole_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEntry" ADD CONSTRAINT "TeamEntry_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEntry" ADD CONSTRAINT "TeamEntry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLink" ADD CONSTRAINT "PlayerLink_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;