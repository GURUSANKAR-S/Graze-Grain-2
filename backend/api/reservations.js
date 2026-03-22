const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dbPath = path.join(__dirname, "..", "db", "reservations.json");

let reservations = [];

try {
  reservations = JSON.parse(fs.readFileSync(dbPath, "utf8"));
} catch (err) {
  console.log("Reservations DB not found or empty");
}

router.get("/", (req, res) => {
  res.json(reservations);
});

router.post("/", (req, res) => {
  const reservation = {
    id: Date.now(),
    customerName: req.body.customerName,
    customerEmail: req.body.customerEmail,
    phone: req.body.phone,
    date: req.body.date,
    time: req.body.time,
    guests: parseInt(req.body.guests),
    specialNotes: req.body.specialNotes || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  reservations.unshift(reservation);
  fs.writeFileSync(dbPath, JSON.stringify(reservations, null, 2));
  res.json(reservation);
});

router.patch("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({
      error: "Invalid status. Must be pending, confirmed, or cancelled.",
    });
  }

  const index = reservations.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  // Check admin auth
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || token !== "admin-token") {
    // Simple token check
    return res.status(401).json({ error: "Admin access required" });
  }

  reservations[index].status = status;
  fs.writeFileSync(dbPath, JSON.stringify(reservations, null, 2));
  res.json({ success: true, reservation: reservations[index] });
});

module.exports = router;
