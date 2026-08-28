const express = require("express");
const StudentsDataRouter = express.Router();
//const studentsData = require("../modules/studentsDataSchema");
const { randomUUID } = require("crypto");
const { getStorage, getTrackingStorage } = require("../../server");
const db = getStorage();
const tdb = getTrackingStorage();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./storage");
  },
  filename: (req, file, cb) => {
    const date = new Date();
    cb(
      null,
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getMilliseconds()}` +
        "-" +
        file.originalname,
    );
  },
});
const upload = multer({ storage });
//middle ware
const addStudentsReqData = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body)
      return res.status(401).json({
        ok: false,
        message: "invalid requst body required post body but got known",
      });
    if (
      !body.firstName.trim() === "" ||
      !body.lastName.trim() === "" ||
      !body.age.trim() === "" ||
      !body.dateOfBirth.trim() === "" ||
      !body.gender.trim() === "" ||
      !body.house.trim() === "" ||
      !body.trackingID.trim() === "" ||
      !body.year.trim() === ""
    )
      return res.status(403).json({
        ok: false,
        message: "invalid requst body one or more fileds are missing",
      });
    if (body.bordingStudent === 0 && body.dayStudent === 0)
      return res.status(403).json({
        ok: false,
        message: "students role is not validated expected 1 & 0 but got 0 & 0",
      });
    if (body.bordingStudent === 1 && body.dayStudent === 1)
      return res.status(403).json({
        ok: false,
        message: "students role is not validated expected 1 & 0 but got 1 & 1",
      });
    next();
  } catch (error) {
    res.status(500).json({ ok: false, message: `server error: ${error}` });
    console.log(`server error: ${error}`);
  }
};
// add new students to list
//test
let count = 0;
//test
StudentsDataRouter.post(
  "/add/new/students",
  upload.single("image"),
  async (req, res) => {
    try {
      let imageURL = null;
      if (req.file) {
        const filename = req.file.filename;
        const url = `http://${req.headers.host}/${filename}`;
        imageURL = url;
      }
      const body = JSON.parse(req.body["students-info"]);
      const userData = {
        firstName: body.firstName,
        middleName: body.middleName,
        lastName: body.lastName,
        age: body.age,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        house: body.house,
        dayStudent: body.dayStudent,
        bordingStudent: body.bordingStudent,
        image: imageURL,
        trackingID: body.trackingID,
        studentYear: body.year,
        createdAt: new Date().toISOString(),
      };
      db.add(JSON.stringify(userData));
      //test
      const location = [
        {
          location: "GSS Karshi (Stable Site Center)",
          status: "stable",
          latitude: 8.815913,
          longitude: 7.556261,
        },
        {
          location: "GSS Karshi (Warning Perimeter)",
          status: "warning",
          latitude: 8.815561,
          longitude: 7.555442,
        },
        {
          location: "GSS Karshi (Secondary Point)",
          status: "stable",
          latitude: 8.815606,
          longitude: 7.557703,
        },
        {
          location: "Orozo Panic Zone",
          status: "panic",
          latitude: 8.82404,
          longitude: 7.569158,
        },
      ];
      const state = [1, 2, 1, 3];

      let latitude = 0;
      let longitude = 0;
      let trackingState = 0;
      if (count < 4) {
        latitude = location[count].latitude;
        longitude = location[count].longitude;
        trackingState = state[count];
      }
      //test
      const trackingData = {
        trackingID: body.trackingID,
        latitude: latitude,
        longitude: longitude,
        accuracy: 0,
        trackingState: trackingState, // 0 unkown // 1 stable // 2 warning // 3 panic
        watchInfo: {
          batteryPercent: count < 4 ? "20" : "0",
          watchTime: count < 4 ? "2:10" : "0.00",
          watchDate: count < 4 ? "08/28/2026" : "00/00/0000",
        },
        locationInfo: {
          locationAccuracy: 0,
          lastTransmistedDate: count < 4 ? "08/28/2026" : "00/00/0000",
          lastThreeKnownLocation: [
            {
              latitude: 0,
              longitude: 0,
            },
          ],
        },
      };
      tdb.set(body.trackingID, trackingData);
      if (!db || !tdb)
        return res.status(500).json({
          ok: false,
          message: `somting went wrong while creating student records error: ${addStudent}`,
        });
      count++;
      return res.status(201).json({
        ok: true,
        message: `succesfuly created students data`,
      });
    } catch (error) {
      res.status(500).json({ ok: false, message: `server error: ${error}` });
      console.log(`server error: ${error}`);
    }
  },
);
//get new tracking ID
StudentsDataRouter.get("/get/new/trackingID", async (req, res) => {
  try {
    const ID = randomUUID();
    return res.status(200).json({
      ok: true,
      message: "succesful",
      ID: ID,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `server error: ${error}` });
    console.log(`server error: ${error}`);
  }
});
//get all students record
StudentsDataRouter.get("/all/students/records", async (req, res) => {
  try {
    const findStudents = [];
    db.forEach((value) => findStudents.push(JSON.parse(value)));
    if (findStudents.length === 0)
      return res.status(404).json({
        ok: true,
        message: "no records found",
        records: findStudents,
      });
    res.status(202).json({
      ok: true,
      message: "succesfull ",
      records: findStudents,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `server error: ${error}` });
    console.log(`server error: ${error}`);
  }
});
//delete student
StudentsDataRouter.put("/delete/student/id/:id", async (req, res) => {
  try {
    const trackingID = req.params.id;
    if (!trackingID)
      return res.status(403).json({
        ok: false,
        message: "invalid requst params no student tracking ID",
      });
    let studentData = null;
    db.forEach((value) => {
      const data = JSON.parse(value);
      if (data.trackingID === trackingID) return (studentData = value);
    });
    tdb.delete(trackingID);
    if (!studentData)
      return res.status(404).json({
        ok: false,
        message: "no student data with the giving ID found",
      });
    db.delete(studentData);
    res.status(200).json({ ok: true, message: "succesful" });
  } catch (error) {
    res.status(500).json({ ok: false, message: `server error: ${error}` });
    console.log(`server error: ${error}`);
  }
});
//validate students trackingID
StudentsDataRouter.get("/validate/id/:id", async (req, res) => {
  try {
    const trackingID = req.params.id;
    if (!trackingID || trackingID.trim() === "")
      return res.status(401).json({
        ok: false,
        message: "invaild or no trackingID",
        isInRecords: false,
      });
    let isInRecords = false;
    db.forEach((value) => {
      const data = JSON.parse(value);
      if (data.trackingID === trackingID) {
        isInRecords = true;
      }
    });
    if (!isInRecords)
      return res.status(404).json({
        ok: false,
        message: "no records with the given trackingID found",
        isInRecords: isInRecords,
      });
    res.status(200).json({
      ok: true,
      message: "succesful",
      isInRecords: isInRecords,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `server error: ${error}` });
    console.log(`server error: ${error}`);
  }
});
module.exports = StudentsDataRouter;
