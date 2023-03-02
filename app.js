const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());
let db = null;
const checkServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running Successfully");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
checkServer();

//GET players API 1
const formatPlayerDetails = (object) => {
  return { playerId: object.player_id, playerName: object.player_name };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    select *
    from player_details`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => formatPlayerDetails(eachPlayer))
  );
});

//GET playersById API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const singlePlayerQuery = `
    select *
    from player_details
    where player_id = ${playerId}`;
  const playerDetail = await db.get(singlePlayerQuery);
  response.send(formatPlayerDetails(playerDetail));
});
//PUT Update playersById API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDet = request.body;
  const { playerName } = playerDet;
  const getPlayerQuery = `
    update player_details 
    set player_name = "${playerName}"
    where player_id = ${playerId}`;
  const getPlayerQueryRes = await db.run(getPlayerQuery);
  response.send("Player Details Updated");
});

//GET MatchById API 4
const formatMatchDetails = (object) => {
  return { matchId: object.match_id, match: object.match, year: object.year };
};

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    select *
    from match_details
    where match_id = ${matchId}`;
  const matchDetail = await db.get(getMatchQuery);
  response.send(formatMatchDetails(matchDetail));
});

//GET /players/:playerId/matches API 5
const formatMatchDetailsList = (match) => {
  return { matchId: match.match_id, match: match.match, year: match.year };
};
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchByPlayerId = `
    SELECT *
    FROM player_match_score 
    NATURAL JOIN match_details
    where player_id = ${playerId} ;
    `;
  const getMatchByPlayerIdRes = await db.all(getMatchByPlayerId);
  response.send(
    getMatchByPlayerIdRes.map((eachMatch) => formatMatchDetailsList(eachMatch))
  );
});

//GET //matches/:matchId/players API 6
const nameIdQueryReqFormat = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  };
};

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const nameIdQuery = `
    select *
    from player_match_score
    NATURAL JOIN player_details
    where match_id = ${matchId} ;
    `;
  const nameIdQueryRes = await db.all(nameIdQuery);
  response.send(nameIdQueryRes.map((each) => nameIdQueryReqFormat(each)));
});

//GET /players/:playerId/playerScores API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const scoresQuery = `
    select 
    player_details.player_id AS playerId ,
    player_details.player_name AS playerName ,
    SUM(player_match_score.score) AS totalScore ,
    SUM(fours) AS  totalFours,
    SUM(sixes) AS totalSixes 
    from player_match_score
    INNER JOIN player_details
    ON player_details.player_id =  player_match_score.player_id
    where player_details.player_id = ${playerId} ;
    `;
  const scoresQueryRes = await db.get(scoresQuery);
  response.send(scoresQueryRes);
});

module.exports = app;
