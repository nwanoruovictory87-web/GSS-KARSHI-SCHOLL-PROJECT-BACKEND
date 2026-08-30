const { Server } = require("socket.io");
const { getStorage, getTrackingStorage } = require("../../server");
//database
const sdb = getStorage();
const tdb = getTrackingStorage();
const activeStudents = new Set();
//
function Socket(serverConnection) {
  const io = new Server(serverConnection, {
    cors: {
      origin: [
        process.env.FRONTEND_URL_DEV,
        process.env.FRONTEND_URL,
        process.env.CLIENT_URL_DEV,
        process.env.CLIENT_URL,
      ],
    },
  });
  let currentActiveStudents = [];
  //emit event to client get location
  setInterval(() => {
    io.emit("send-live-location");
  }, 20000); // requst students live location every 20 sec
  // send ping to client are you active every 1min (60) secs
  setInterval(() => {
    io.emit("are-you-active-client");
    //validate whos active after 30s
    setTimeout(() => {
      activeStudents.clear(); // clear prevous list of active students
      currentActiveStudents.forEach((value) => {
        activeStudents.add(value); // set list with now active students
      });
      currentActiveStudents = []; // clear temb active students storage for new active list
    }, 30000); // 30s after parent function is called
  }, 60000); // every 60s
  //
  let respondedClientsId = [];
  setInterval(() => {
    io.emit("are-you-there-client");
    //clean up
    setTimeout(() => {
      sdb.forEach((value) => {
        const data = JSON.parse(value);
        const trackingID = data.trackingID;
        if (
          activeStudents.has(trackingID) &&
          !respondedClientsId.includes(trackingID)
        ) {
          if (tdb.has(trackingID)) {
            const sTdb = tdb.get(trackingID);
            if (sTdb.trackingState != 0) {
              tdb.set(trackingID, { ...sTdb, trackingState: 2 }); // set to panic
            }
          }
        } else if (
          activeStudents.has(trackingID) &&
          respondedClientsId.includes(trackingID)
        ) {
          const sTdb = tdb.get(trackingID);
          if (sTdb.trackingState != 0) {
            tdb.set(trackingID, { ...sTdb, trackingState: 1 }); // set to panic
          }
        }
      });
      respondedClientsId = [];
    }, 15000);
  }, 60000); // every 60 sec
  //
  io.on("connection", (socket) => {
    console.log(socket.id);
    //
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

    //listen event client
    socket.on("get-live-location", (locationData, trackingID) => {
      if (tdb.has(trackingID)) {
        const data = tdb.get(trackingID, locationData);
        let trackingState = 1;
        if (data.trackingState === 3) {
          trackingState = 3;
        } else if (data.trackingState === 2) {
          trackingState = 2;
        }
        tdb.set(trackingID, { ...locationData, trackingState: trackingState });
      }
    });
    //listen on client panic event
    socket.on("get-panic-call", (locationData, trackingID) => {
      if (tdb.has(trackingID)) {
        console.log(locationData);
        tdb.set(trackingID, locationData);
      }
    });
    //listen on client requst for watch state
    socket.on("get-watch-state", (trackingID) => {
      if (tdb.has(trackingID)) {
        const data = tdb.get(trackingID);
        const state = data.trackingState;
        socket.emit("send-watch-state", state);
      }
    });
    //listen on overview ping requst get all needed data
    socket.on("get-overview-data", () => {
      //studentsHiglightsData
      const totalStudnets = sdb.size;
      let resumedStudents = 0;
      tdb.forEach((value) => {
        if (value.trackingState != 0) {
          resumedStudents++;
        }
      });
      const activeStudentsCount = activeStudents.size;
      const inActiveStudentsCount =
        resumedStudents > 0 ? resumedStudents - activeStudentsCount : 0;
      //alertsCountData
      let panicCount = 0;
      let warningCount = 0;
      let stableCount = 0;
      //importantAlertsData
      const importantAlertsData = [];
      //
      tdb.forEach((value) => {
        if (value.trackingState === 1) {
          stableCount++;
        } else if (value.trackingState === 2) {
          warningCount++;
        } else if (value.trackingState === 3) {
          panicCount++;
        }
        //importantAlert
        if (value.trackingState === 2 || value.trackingState === 3) {
          const alertsData = {
            trackingID: value.trackingID,
            watchTime: value.watchInfo.watchTime,
            trackingState: value.trackingState,
          };
          importantAlertsData.push(alertsData);
        }
      });
      //responds data
      const responds = {
        alertsCountData: {
          panicCount: panicCount,
          warningCount: warningCount,
          stableCount: stableCount,
        },
        importantAlertsData: importantAlertsData,
        studentsDailyGraphData: {
          total: totalStudnets,
          resumed: resumedStudents,
          active: activeStudentsCount,
          inActive: inActiveStudentsCount,
        },
        studentsHiglightsData: {
          total: totalStudnets,
          resumed: resumedStudents,
          active: activeStudentsCount,
          inActive: inActiveStudentsCount,
        },
      };
      //
      socket.emit("send-overview-data", responds);
      //
    });
    // overview data logic
    // listen on am active client responds to are you active ping

    socket.on("am-active-client", (trackingID) => {
      if (!currentActiveStudents.includes(trackingID)) {
        currentActiveStudents.push(trackingID);
      }
    });
    socket.on("am-here", (trackingID) => {
      if (!respondedClientsId.includes(trackingID)) {
        respondedClientsId.push(trackingID);
      }
    });
    //dev send saved tracking id
    socket.on("get-tracking-id-admin", (trackingId) => {
      //
      //console.log("recived id", trackingId);
      socket.broadcast.emit("get-tracking-id-client", trackingId);
    });
  });
}
module.exports = { Socket };
