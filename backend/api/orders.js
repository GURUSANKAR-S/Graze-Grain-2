const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dbPath = path.join(__dirname, "..", "db", "orders.json");

let orders = [];

try {
  orders = JSON.parse(fs.readFileSync(dbPath, "utf8"));
} catch (err) {
  console.log("Orders DB not found or empty");
}

router.get("/", (req, res) => {
  res.json(orders);
});

router.post("/", (req, res) => {
  const order = {
    id: Date.now(),
    customerId: req.body.customerId || "guest",
    items: req.body.items,
    total: req.body.total,
    status: "pending",
    createdAt: new Date().toISOString(),
    address: req.body.address || "",
    paymentMethod: req.body.paymentMethod || "cash",
  };
  orders.unshift(order);
  fs.writeFileSync(dbPath, JSON.stringify(orders, null, 2));
  res.json(order);
});

module.exports = router;
