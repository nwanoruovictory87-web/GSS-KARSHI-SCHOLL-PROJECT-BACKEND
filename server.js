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
const server = http.createServer(app);
//
const { Socket } = require("./src/controllers/socket");
//create socket instance with server
Socket(server);
//
const port = process.env.SERVER_PORT | 3000;
server.listen(port, () => {
  console.log(`server runing on port ${port}`);
});
console.log("hi");
