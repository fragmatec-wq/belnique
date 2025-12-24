const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
      {
        itemType: { type: String, enum: ['Course', 'Artwork', 'Event'], required: true },
        item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'orderItems.itemType' },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
      }
    ],
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    status: { type: String, default: 'processing' }, // processing, delivered, cancelled
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
