const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
   {
      description: {
         type: String,
         required: true,
      },
      name: {
         type: String,
         required: true,
      },
      productImage: {
         // in mongodb we can also store images , we just need to store the path of the image
         // use aws bucket to store images
         // cloudinary is also a good option, we will store the image in cloudinary and store the path in mongodb as a string
         type: String,
      },
      price: {
         type: Number,
         default: 0,
      },
      stock: {
         type: Number,
         default: 0,
      },
      category: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Category",
         required: true,
      },
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
   },
   { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
