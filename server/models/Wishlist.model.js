const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AddCoupon', 
    required: true,
  },
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
