const http = require("http");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL_DEV, process.env.FRONTEND_URL],
    credentials: true,
  }),
);
app.use(express.json());
const server = http.createServer(app);
//
//database
const studentDataDatabase = new Set();
const trackingLocationDatabase = new Map();
//
function getStorage() {
  return studentDataDatabase;
}
function getTrackingStorage() {
  return trackingLocationDatabase;
}
module.exports = { getStorage, getTrackingStorage };
//
const { Socket } = require("./src/controllers/socket");
//create socket instance with server
Socket(server);
//
const port = process.env.SERVER_PORT | 3000;

/*
const DATABASE_URL = process.env.DATABASE_URL_PRO
  ? process.env.DATABASE_URL_PRO
  : process.env.DATABASE_URL_DEV;
*/
/*
mongoose
  .connect(DATABASE_URL)
  .then((e) => {
    console.log("connected to database");
    server.listen(port, () => {
      console.log(`server runing on port ${port}`);
    });
  })
  .catch((er) => {
    console.log(`database error :${er}`);
  });
*/

server.listen(port, () => {
  console.log(`server runing on port ${port}`);
});

//import routes
const studentsData = require("./src/controllers/studentsData");
const trackingFlow = require("./src/controllers/tracking");

//use routes
app.use("/students", studentsData);
app.use("/tracking", trackingFlow);
//
