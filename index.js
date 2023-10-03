const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const port = process.env.PORT || 4002;
const app = express();
require("dotenv").config();

// import the routes
const authRoute = require("./routes/auth");
const shopItemsRoute = require("./routes/shopItems");

// connect to database
const connect = mongoose.connect(process.env.mongoDBURL);

connect
  .then(() => {
    console.log("Connected to my database");
  })
  .catch((error) => {
    console.log("could not connect to database " + error);
  });

//  middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/v2/auth", authRoute);
app.use("/v2/items", shopItemsRoute);

// listen to port
app.listen(port, () => {
  console.log("Listening on port " + port);
});
