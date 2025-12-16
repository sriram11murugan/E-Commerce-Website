const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: String,
  desc: String,
  price: Number,
  img: String,
  category: String,
});

module.exports = mongoose.model("Product", ProductSchema);