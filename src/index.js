require("dotenv").config();
const app = require("./app");
const connectDB = require("./db/index");

connectDB()
   .then(() => {
      app.listen(process.env.PORT || 8000, () => {
         console.log("server initated at : " + process.env.PORT);
      });
   })
   .catch((error) => {
      console.log("MONGODB CONNECTION ERROR: ", error);
   });
