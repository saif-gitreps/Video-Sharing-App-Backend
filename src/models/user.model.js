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
         type: String, // cloudinarry url
         required: true,
      },
      coverImage: {
         type: String, // cloudinary url
      },
      watchHistory: [
         {
            type: mongoose.Schema.ObjectId,
            ref: "Video",
         },
      ],
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

userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) {
      return next();
   }
   this.password = await bcrypt.hash(this.password, 12);
   next();
});

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
