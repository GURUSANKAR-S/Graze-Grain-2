const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const authRouter = require("./api/auth");
const categoriesRouter = require("./api/categories");
const menuItemsRouter = require("./api/menu-items");
const ordersRouter = require("./api/orders");
const reservationsRouter = require("./api/reservations");
app.use("/auth", authRouter);
app.use("/categories", categoriesRouter);
app.use("/menu-items", menuItemsRouter);
app.use("/orders", ordersRouter);
app.use("/reservations", reservationsRouter);

app.get("/", (req, res) => {
  res.send("Hello from the Graze & Grain API!");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
