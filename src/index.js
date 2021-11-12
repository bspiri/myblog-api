require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.NODE_PORT;

app.use(cors());
app.use(bodyParser.json());
app.use("/user", require("./user"));
app.use("/about", require("./about"));
app.use("/contact", require("./contact"));
app.use("/portfolio", require("./portfolio"));
app.use("/post", require("./post"));
app.use("/social", require("./social"));
app.use("/tag", require("./tag"));
app.use("/logo", require("./logo"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => console.log(`Myblog api listening on port ${port}!`));
