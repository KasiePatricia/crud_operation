const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { shopItemsCollection } = require("../schema/shopItemsSchema");

require("dotenv").config();
const { isUserLoggedin, adminsOnly } = require("../middlewares/middleware");

const secret = process.env.secret;

router.use(isUserLoggedin);

// view all the items in the shop
router.get("/", async (req, res) => {
  try {
    const item = await shopItemsCollection.find();
    res.json(item);
  } catch (error) {
    console.log(error);
    res.status(500).send("internal-server-error");
  }
});

// view a single item in the shop
router.get("/:id", async (req, res) => {
  try {
    const task = await shopItemsCollection.findById(req.params.id);
    res.send(task);
  } catch (error) {
    console.log(error);
    res.status(500).send("internal-server-error");
  }
});

router.use(adminsOnly);

// add an item in the shop
router.post("/", async (req, res) => {
  const { itemsName, description, price, isInStock } = req.body;
  const { userId } = req.decoded;
  try {
    const newItem = await shopItemsCollection.create({
      itemsName,
      description,
      price,
      isInStock,
      user: userId,
    });
    res.json({ isRequestSuccessful: true, newItem });
  } catch (error) {
    console.log(error);
    res.status(500).send("internal-server-error");
  }
});

// edit an item in the shop
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { itemsName, description, price, isInStock } = req.body;
  try {
    const updatedItem = await shopItemsCollection.findByIdAndUpdate(
      id,
      { itemsName, description, price, isInStock },
      { new: true }
    );

    res.json({ message: "ShopItem updated", updatedItem });
  } catch (error) {
    console.log(error);
    res.status(500).send("internal-server-error");
  }
});

// delete an item from the shop
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const note = await shopItemsCollection.findById(id);

    if (!id) {
      res.status(401).send("No id");
      return;
    }
    await shopItemsCollection.findByIdAndDelete(id);
    res.send("Item deleted");
  } catch (error) {
    console.log(error);
    res.status(500).send("internal-server-error");
  }
});

module.exports = router;
