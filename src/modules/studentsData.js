const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const StudentSchema = new Schema({
  firstName: { type: String, required: true },
  middleName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, required: true },
  house: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, required: false },
  trackingID: { type: String, required: true },
  studentYear: { type: String, required: true },
});
StudentSchema.index({ studentYear: 1, house: 1, gender: 1 });
StudentSchema.index({ studentYear: 1 });
StudentSchema.index({ trackingID: 1 });

mongoose.model("studentsData", StudentSchema);
module.exports = StudentSchema;
