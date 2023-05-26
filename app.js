const express = require("express");
const app = express();

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `select movie_name from movie order by movie_id`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//API 2
app.use(express.json());

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postQuery = `insert into movie(director_id,movie_name,lead_actor) 
    values(${directorId},'${movieName}','${leadActor}')`;
  const dbResponse = await db.run(postQuery);
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getQuery = `select * from movie where movie_id = ${movieId}`;
  const dbResponse = await db.get(getQuery);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `update movie set
        movie_id = ${movieId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}' where movie_id = ${movieId}`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `delete from movie where movie_id = ${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `select * from director order by director_id`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const directorQuery = `select movie_name from movie inner join director on movie.director_id = director.director_id group by director.director_name`;
  const queryArray = await db.all(directorQuery);
  response.send(
    queryArray.map((eachItem) => convertDbObjectToResponseObject(eachItem))
  );
});
module.exports = app;
