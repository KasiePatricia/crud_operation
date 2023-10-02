const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userCollection } = require("../schema/userSchema");
const { isUserLoggedin } = require("../middlewares/middleware");

require("dotenv").config();

const secret = process.env.secret;

router.post("/register", async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    await userCollection.create({
      fullName: req.body.fullName,
      username: req.body.username,
      role: req.body.role,
      password: hashedPassword,
    });

    res.status(201).send("created successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("internal-server-error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const userDetail = await userCollection.findOne({ username: username });
    if (!userDetail) return res.status(404).send("user not found");

    const doesPasswordMarch = bcrypt.compareSync(password, userDetail.password);
    if (!doesPasswordMarch) return res.status(400).send("Invalid credential");

    const { username: userName, _id, role } = userDetail;

    const token = jwt.sign(
      {
        username: userName,
        userId: _id,
        role: role,
      },
      secret
    );

    res.send({ message: "LoggedIn successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).send("internal-server-error");
  }
});

router.get("/profile", isUserLoggedin, async (req, res) => {
  try {
    const { userId } = req.decoded;
    const user = await userCollection.findById(userId, "-password");
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("internal-server-error");
  }
});

module.exports = router;
