const express = require("express");
const StudentsDataRouter = express.Router();
const studentsData = require("../modules/studentsDataSchema");
const { randomUUID } = require("crypto");
//middle ware
const addStudentsReqData = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body)
      return res.status(401).json({
        ok: false,
        message: "invalid requst body one or more fileds are missing",
      });
    if (
      !body.firstName.trim() === "" ||
      !body.middleName ||
      !body.lastName.trim() === "" ||
      !body.age.trim() === "" ||
      !body.dateOfBirth.trim() === "" ||
      !body.gender.trim() === "" ||
      !body.house.trim() === "" ||
      !body.dayStudent ||
      !body.bordingStudent ||
      !body.trackingID.trim() === "" ||
      !body.studentYear.trim() === ""
    )
      return res.status(401).json({
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
        studentYear: body.studentYear,
        createdAt: new Date().toISOString(),
      };
      const addStudent = await studentsData.insertOne(userData);
      if (!addStudent)
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
module.exports = StudentsDataRouter;
