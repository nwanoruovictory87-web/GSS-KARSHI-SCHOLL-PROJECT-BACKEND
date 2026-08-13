const { Server } = require("socket.io");
function Socket(serverConnection) {
  const io = new Server(serverConnection, {
    cors: {
      origin: [process.env.FRONTEND_URL_DEV, process.env.FRONTEND_URL],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    console.log(`socket id ${socket.id} is connected`);
  });
}
module.exports = { Socket };
