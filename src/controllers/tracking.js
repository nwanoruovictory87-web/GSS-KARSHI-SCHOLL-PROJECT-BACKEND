const express = require("express");
const TrackingData = express.Router();
const { getStorage, getTrackingStorage } = require("../../server");
const sdb = getStorage();
const tdb = getTrackingStorage();
TrackingData.get("/student/tracking/data/:id", async (req, res) => {
  try {
    const trackingID = req.params.id;
    if (!trackingID)
      return res.status(401).json({
        ok: false,
        message:
          "invalid requst parames required student tracking ID but gor known",
      });
    //
    let studentData = null;
    sdb.forEach((value) => {
      const data = JSON.parse(value);
      if (data.trackingID === trackingID) return (studentData = data);
    });
    if (!studentData || !tdb.has(trackingID))
      return res.status(404).json({
        ok: false,
        message: "no student data with the giving ID found",
      });
    //
    const trackingData = tdb.get(trackingID);
    const studentTrackingData = {
      ...studentData,
      ...trackingData,
    };
    res.status(200).json({
      ok: true,
      messsage: "succesfull got student tracking record",
      record: studentTrackingData,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `server error: ${error}` });
    console.log(`server error: ${error}`);
  }
});
//
module.exports = TrackingData;
