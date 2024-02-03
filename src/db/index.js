require("dotenv").config();
const mongoose = require("mongoose");
const DB_NAME = require("../constraint");

const connectDB = async () => {
   try {
      const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      console.log(
         `\nMongoDb connected, host: ${connection.connection.host}, dbs: ${DB_NAME}`
      );
   } catch (error) {
      console.log("MONGODB ERROR: ", error);
      process.exit(1);
   }
};

module.exports = connectDB;
