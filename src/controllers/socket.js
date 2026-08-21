const { Server } = require("socket.io");
const { getStorage, getTrackingStorage } = require("../../server");
const sdb = getStorage();
const tdb = getTrackingStorage();
function Socket(serverConnection) {
  const io = new Server(serverConnection, {
    cors: {
      origin: [process.env.FRONTEND_URL_DEV, process.env.FRONTEND_URL],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    //listen on admin requst for new location
    socket.on("get-students-location", () => {
      const gpsLocationList = [];
      tdb.forEach((value) => {
        const data = {
          trackingID: value.trackingID,
          latitude: value.latitude,
          longitude: value.longitude,
        };
        gpsLocationList.push(data);
      });
      socket.emit("all-students-location", gpsLocationList);
      //
    });
    //
  });
}
module.exports = { Socket };
