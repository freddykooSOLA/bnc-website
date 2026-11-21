import { runScorelabSync } from '../lib/scorelab-sync';

async function main() {
  const started = Date.now();
  const result = await runScorelabSync({ dryRun: true });
  console.log('ScoreLab sync dry-run (no DB writes)');
  console.log('Duration (s):', Math.round((Date.now() - started) / 1000));
  for (const [leagueId, row] of Object.entries(result.perLeague)) {
    console.log(
      `${leagueId}: teams=${row.teams} players=${row.players} playerSeasons=${row.playerSeasons}`
    );
  }
  console.log(
    `TOTAL teams=${result.teams} players=${result.players} playerSeasons=${result.playerSeasons}`
  );
  if (result.errors.length) {
    console.log('errors:', JSON.stringify(result.errors));
    process.exit(1);
  }
}

void main();