const router = require("express").Router();
const db = require("../db");
const authRequired = require("../authRequired");

router.get("/", authRequired, (req, res) => {
  db.query("SELECT * FROM tag", function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      res.json(data);
    }
  });
});

router.post("/", authRequired, (req, res) => {
  const sql = `INSERT INTO tag (name) VALUES ('${req.body.name}')`;
  console.log(sql);
  db.query(sql, function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      //insert is successful. Get insertId from database
      const lastInsertedTagId = data.insertId;
      const sql2 = `SELECT * FROM tag WHERE id = ${lastInsertedTagId}`;
      db.query(sql2, function (err, data) {
        if (err) {
          res.status(500).send("sql error");
        } else {
          res.json(data[0]);
        }
      });
    }
  });
});

module.exports = router;
