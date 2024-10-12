const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddCouponSchema = new Schema({
  merchantEmail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  coupon: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'buyOneGet'],
    required: true,
  },
  percentage: {
    type: Number,
    required: function () {
      return this.discountType === 'percentage';
    },
  },
  fixedAmount: {
    type: Number,
    required: function () {
      return this.discountType === 'fixed';
    },
  },
  buyOneGet: {
    type: Number,
    required: function () {
      return this.discountType === 'buyOneGet';
    },
  },
  buyOneGetQuantity: {
    type: Number,
    required: function () {
      return this.discountType === 'buyOneGet';
    },
  },
  startDate: {
    type: Date,
    required: true,
  },
  usageLimits: {
    type: Number,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  latitude: {
    type: Number, // Assuming latitude is a number
    required: true,
  },
  longitude: {
    type: Number, // Assuming longitude is a number
    required: true,
  },
  address: {
    type: String, // Add the address field as a string
    required: true,
  },
});

const AddCoupon = mongoose.model('AddCoupon', AddCouponSchema);

module.exports = AddCoupon;
