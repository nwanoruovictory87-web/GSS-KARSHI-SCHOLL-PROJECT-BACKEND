const express = require("express");
const StudentsDataRouter = express.Router();
//const studentsData = require("../modules/studentsDataSchema");
const { randomUUID } = require("crypto");
const { getStorage, getTrackingStorage } = require("../../server");
const db = getStorage();
const tdb = getTrackingStorage();
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
      !body.middleName ||
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
StudentsDataRouter.post(
  "/add/new/students",
  addStudentsReqData,
  async (req, res) => {
    try {
      const body = req.body;
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
        image: body.image,
        trackingID: body.trackingID,
        studentYear: body.year,
        createdAt: new Date().toISOString(),
      };
      db.add(JSON.stringify(userData));
      const trackingData = {
        trackingID: body.trackingID,
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        trackingState: 0, // 0 unkown // 1 stable // 2 warning // 3 panic
        watchInfo: {
          batteryPercent: "0",
          watchTime: "0:00AM",
        },
        locationInfo: {
          locationAccuracy: 0,
          lastTransmistedDate: "00/00/0000",
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
//
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
module.exports = StudentsDataRouter;
