var express = require("express");
var cors = require("cors");
var connectDB = require("./config/db");

var app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", function(req, res) {
  res.send("ShopVersa Backend Running...");
});

// product routes
app.use("/api/products", require("./routes/productRoutes"));

var PORT = 5000;
app.listen(PORT, function() {
  console.log("Server running on port " + PORT);
});