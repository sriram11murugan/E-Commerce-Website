var express = require("express");
var Product = require("../models/Product");
var router = express.Router();

// GET all products
router.get("/", function(req, res) {
  Product.find(function(err, products) {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(products);
  });
});

// ADD a product
router.post("/", function(req, res) {
  var newProduct = new Product(req.body);
  newProduct.save(function(err, savedProduct) {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json({ message: "Product added", product: savedProduct });
  });
});

module.exports = router;