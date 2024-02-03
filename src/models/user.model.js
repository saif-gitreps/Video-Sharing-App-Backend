const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
   {
      username: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
         //basically makes a field/property easier to search if you're gonna search it frequently.
         //it makes it optimized although it is expensive
         index: true,
      },
      email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
      },
      fullname: {
         type: String,
         required: true,
         trim: true,
         index: true,
      },
      avatar: {
         type: String, // will store cloudinary URLs of our avatar
         required: true,
      },
      coverImage: {
         type: String, // cloudinary url
      },
      watchHistory: {
         type: [
            {
               type: mongoose.Schema.ObjectId,
               ref: "Video",
            },
         ],
      },
      password: {
         type: String,
         required: [true, "Password cannot be empty"],
      },
      refreshToken: {
         type: String,
      },
   },
   { timestamps: true }
);
// remember arrow function cannot keep reference, tats why we use the traditional method.
// this is a middle that performs something when a query might be runnig, like if save method were
// to run then we would so something.
// now another problem that might arise with this code is that everytime a user updates anything else,
// this password will get encrypted again no matter what. so we have to add some conditions.
// we only want this encyrption to happen only during the frist time or if the user has updated their password.
userSchema.pre("save", async function (next) {
   // [did some research about this isModified method.
   // check the change password controller method]
   if (!this.isModified("password")) {
      return next();
   }
   this.password = await bcrypt.hash(this.password, 12);
   next();
});

// making our custom models.
userSchema.methods.isPasswordValid = async function (password) {
   const check = await bcrypt.compare(password, this.password);
   return check;
};

userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
      {
         _id: this._id,
         email: this.email,
         username: this.username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
         expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
   );
};
userSchema.methods.generateRefreshToken = function () {
   return jwt.sign(
      {
         _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
         expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
   );
};

const User = mongoose.model("User", userSchema);

module.exports = User;
