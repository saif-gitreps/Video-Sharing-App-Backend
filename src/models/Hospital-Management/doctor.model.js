const mongoose = require("mongoose");

const workingHospitalsSchema = new mongoose.Schema({
   hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
   },
   workingHours: {
      type: String,
   },
});

const doctorSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
      },
      salary: {
         type: String,
         required: true,
      },
      qualifications: {
         type: String,
         required: true,
      },
      experienceInYears: {
         type: Number,
         default: 0,
      },
      // an example of storing array as a property
      worksInHospitals: [workingHospitalsSchema],
   },
   { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
