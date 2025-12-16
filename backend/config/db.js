var mongoose = require("mongoose");

function connectDB() {
  mongoose.connect("mongodb://0.0.0.0/shopversa", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, function(err) {
    if (err) {
      console.log("Mongo Error", err);
    } else {
      console.log("MongoDB Connected");
    }
  });
}

module.exports = connectDB;