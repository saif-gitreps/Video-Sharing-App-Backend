const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         reqyured: true,
      },
      addressLine1: {
         type: String,
         reqyured: true,
      },
      addressLine2: {
         type: String,
         reqyured: true,
      },
      city: {
         type: String,
         reqyured: true,
      },
      // recommended to keep pincode in Strings , from experience
      pincode: {
         type: String,
         reqyured: true,
      },
      speciality: {
         type: [{ type: String }],
      },
   },
   { timestamps: true }
);

const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;
