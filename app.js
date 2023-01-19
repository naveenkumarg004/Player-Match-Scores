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

//GET playersByid API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const singlePlayerQuery = `
    select *
    from player_details
    where player_id = ${playerId}`;
  const playerDetail = await db.get(inglePlayerQuery);
  response.send(formatPlayerDetails(playerDetail));
});
//PUT Update playersByid API 3
app.put("/players/:playerId/", (request, response) => {
  const { playerId } = request.params;
  const playerDet = request.body;
  const { playerName } = playerDet;
  const getPlayerQuery = `
    update player_details 
    set player_name = `${playerName}`
    where player_id = ${playerId}`;
    response.send("Player Details Updated")
});

//GET MatchById API 4
const formatMatchDetails = (object) => {
  return { matchId: object.match_id, match: object.match ,year: object.year };
}

app.get("/matches/:matchId/" ,async (request, response) =>{
    const {matchId} = request.params
    const getMatchQuery = `
    select *
    from match_details
    where match_id = ${matchId}`
    const matchDetail = await db.get(getMatchQuery)
    response.send(formatMatchDetails(matchDetail))
})

//GET /players/:playerId/matches API 5

app.get("/players/:playerId/matches" , (request , response) =>{
    const { playerId } = request.params;

})

