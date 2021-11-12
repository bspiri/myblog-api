const db = require("../db");
const router = require("express").Router();
const sha512 = require("js-sha512");
const jwt = require("jsonwebtoken");
const config = require("../config");
const authRequired = require("../authRequired");

router.get("/", (req, res) => {
  db.query(
    "SELECT content from site WHERE name = 'about'",
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        res.json(data[0]);
      }
    }
  );
});

router.put("/", authRequired, (req, res) => {
  const sql = `UPDATE site SET content = ? WHERE name = 'about'`
  db.query(
    sql,
    [req.body.content],
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
      db.query(
          "SELECT content FROM site WHERE name = 'about'",
          function (err, data) {
            if (err) {
              res.status(500).send("sql error");
            } else res.json(data[0]);
          }
        );
      }
    }
  );
});

module.exports = router;
