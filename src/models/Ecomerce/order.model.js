const mongoose = require("mongoose");

//a mini model

const orderItemSchema = new mongoose.Schema({
   productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
   },
   quantity: {
      type: Number,
      required: true,
   },
});

const orderSchema = new mongoose.Schema(
   {
      orderPrice: {
         type: Number,
         required: true,
      },
      customer: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
      },
      orderItems: {
         // example of array as type, here we need to store an item
         // and the quantity of that item, so technically we needed an object for that,
         // so we have to create a mini model for that.
         type: [orderItemSchema],
         /*
         other approach is 
         type: [ 
                { 
                    productId : {
                        type: mongoose.Schema.Types.ObjectId , 
                        ref:"Product"
                    },
                    quantity :{
                        type: number,
                    }
                }
            ]
         */
      },
      address: {
         type: String,
         required: true,
      },
      status: {
         type: String,
         // enum means choices, means the value can be any of these from the array.
         enum: ["PENDING", "CANCELLED", "DELIVERED"],
         default: "PENDING",
      },
   },
   { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
