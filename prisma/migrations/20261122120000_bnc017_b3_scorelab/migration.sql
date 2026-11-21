-- CreateTable
CREATE TABLE "ScoreLabTeam" (
    "id" TEXT NOT NULL,
    "scorelabId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "leagueSlug" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "syncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoreLabTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreLabPlayer" (
    "id" TEXT NOT NULL,
    "scorelabId" TEXT NOT NULL,
    "teamScorelabId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT,
    "image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "former" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoreLabPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreLabPlayerSeason" (
    "id" TEXT NOT NULL,
    "playerScorelabId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "PTS" INTEGER NOT NULL DEFAULT 0,
    "REB" INTEGER NOT NULL DEFAULT 0,
    "AST" INTEGER NOT NULL DEFAULT 0,
    "STL" INTEGER NOT NULL DEFAULT 0,
    "BLK" INTEGER NOT NULL DEFAULT 0,
    "threePM" INTEGER NOT NULL DEFAULT 0,
    "efficiency" INTEGER NOT NULL DEFAULT 0,
    "syncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoreLabPlayerSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreLabSyncRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "ok" BOOLEAN NOT NULL DEFAULT false,
    "teams" INTEGER NOT NULL DEFAULT 0,
    "players" INTEGER NOT NULL DEFAULT 0,
    "errorsJson" TEXT,

    CONSTRAINT "ScoreLabSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScoreLabTeam_leagueId_idx" ON "ScoreLabTeam"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreLabTeam_leagueId_scorelabId_key" ON "ScoreLabTeam"("leagueId", "scorelabId");

-- CreateIndex
CREATE INDEX "ScoreLabPlayer_leagueId_idx" ON "ScoreLabPlayer"("leagueId");

-- CreateIndex
CREATE INDEX "ScoreLabPlayer_leagueId_teamScorelabId_idx" ON "ScoreLabPlayer"("leagueId", "teamScorelabId");

-- CreateIndex
CREATE INDEX "ScoreLabPlayer_name_idx" ON "ScoreLabPlayer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreLabPlayer_leagueId_scorelabId_key" ON "ScoreLabPlayer"("leagueId", "scorelabId");

-- CreateIndex
CREATE INDEX "ScoreLabPlayerSeason_leagueId_seasonId_idx" ON "ScoreLabPlayerSeason"("leagueId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreLabPlayerSeason_playerScorelabId_leagueId_seasonId_key" ON "ScoreLabPlayerSeason"("playerScorelabId", "leagueId", "seasonId");

-- AddForeignKey
ALTER TABLE "ScoreLabPlayerSeason" ADD CONSTRAINT "ScoreLabPlayerSeason_playerScorelabId_leagueId_fkey" FOREIGN KEY ("playerScorelabId", "leagueId") REFERENCES "ScoreLabPlayer"("scorelabId", "leagueId") ON DELETE RESTRICT ON UPDATE CASCADE;
