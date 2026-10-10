-- HOME-VOTE (2026-10-10, the owner: "I want to implement a house voting system within vicinity of player houses. If the
-- house votes run negative, the exterior decorations/interior decorations should not be shown to other players"):
-- A TOWN'S WORD ON A PLAYER'S HOUSE (src/net/homeVoteLaw.js, server-account/src/homeVotes.js).
--
--   npx wrangler d1 migrations apply daggerfall-accounts --remote
--
-- Applied exactly once through the `d1_migrations` ledger, which the deploy runs (ACC1-CI).
--
-- One row an account's vote on one online home (a guild's hall among them): `vote` -1 or +1, taken back by deleting
-- the row. The home's score is its rows summed (homes.js homesInTown reads it with the town); the primary key is the
-- sum's index. The votes go with the home - sold, released, moved by the arena (the cascade through `homes`): a new
-- owner starts from none - and with the voting account.
CREATE TABLE IF NOT EXISTS home_votes (
  map_id       INTEGER NOT NULL,
  building_key INTEGER NOT NULL,
  player       TEXT NOT NULL,
  vote         INTEGER NOT NULL CHECK (vote IN (-1, 1)),
  voted_at     INTEGER NOT NULL,
  PRIMARY KEY (map_id, building_key, player),
  FOREIGN KEY (map_id, building_key) REFERENCES homes(map_id, building_key) ON DELETE CASCADE,
  FOREIGN KEY (player) REFERENCES players(id) ON DELETE CASCADE
);
