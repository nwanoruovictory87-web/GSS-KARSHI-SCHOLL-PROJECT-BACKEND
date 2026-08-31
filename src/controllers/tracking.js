const express = require("express");
const TrackingData = express.Router();
const { getStorage, getTrackingStorage } = require("../../server");
const sdb = getStorage();
const tdb = getTrackingStorage();
//
const { GoogleGenAI } = require("@google/genai");
//
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
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
//
TrackingData.post("/student/tracking/aioverview", async (req, res) => {
  const {
    fullName,
    age,
    gender,
    schoolHouse,
    watchBattery, // mapping watch time 44% to battery
    lat,
    lng,
    watchDate,
    watchTime,
    currentDate,
  } = req.body;
  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      // We pass the strict rules via system instructions
      config: {
        systemInstruction: `You are a school tracking data formatter. Take the provided student watch parameters and turn them into a single, clean narrative summary. Map latitude around 8 and longitude around 7 directly to "GSS Karshi". Format dates as text. Match this layout exactly: "[Name], a [Age] year old [Gender] student in [House] house was last seen in [Location] at [Time] on [Date]. The tracking device's last known battery percent is [Battery] percent. This is all that was gotten from [Date] to [CurrentDate]."`,
      },
      contents: `
        Format this raw data:
        - studentName: ${fullName}
        - studentAge: ${age}
        - studentGender: ${gender}
        - studentHouse: ${schoolHouse}
        - watchTime/battery: ${watchBattery}
        - studentLocation: lat ${lat}, lng ${lng}
        - dataLocationReceivedDate: ${watchDate}
        - timeLocationReceived: ${watchTime}
        - currentSystemDate: ${currentDate}
      `,
    });

    res.json({ ok: true, message: "succesful", text: aiResponse.text.trim() });
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to generate quick insight overview",
    });
  }
});

module.exports = TrackingData;
