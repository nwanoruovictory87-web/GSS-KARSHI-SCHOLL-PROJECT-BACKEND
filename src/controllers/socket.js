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
    //listen on admin requst for alert state
    socket.on("get-students-alert", () => {
      console.log("alert ping recived");
      const studentsData = [];
      //
      sdb.forEach((value) => {
        const data = JSON.parse(value);
        if (tdb.has(data.trackingID)) {
          const trackingData = tdb.get(data.trackingID);
          const studentTrackingData = {
            ...data,
            ...trackingData,
          };
          studentsData.push(studentTrackingData);
        }
      });
      //
      socket.emit("all-students-alert", studentsData);
    });
    //
  });
}
module.exports = { Socket };
