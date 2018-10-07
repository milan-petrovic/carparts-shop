const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  product: { type: mongoose.Schema.Types, required: true, ref: 'Product'},
  creator: { type: mongoose.Schema.Types.String, ref: 'User', required: true },
});

module.exports = mongoose.model('Order', orderSchema);
