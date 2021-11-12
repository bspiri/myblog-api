const router = require("express").Router();
const db = require("../db");
const sha512 = require("js-sha512");
const jwt = require("jsonwebtoken");
const config = require("../config");
const authRequired = require("../authRequired");

router.post("/", (req, res) => {
  const sql = `INSERT INTO contact (name, email, message) VALUES ('${req.body.name}', '${req.body.email}', '${req.body.message}')`;
  db.query(sql, function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      //insert is successful. Get insertId from database
      const lastInsertedContactId = data.insertId;
      const sql2 = `SELECT * FROM contact where id = ${lastInsertedContactId}`;
      db.query(sql2, function (err, data) {
        if (err) {
          res.status(500).send("sql select error");
        } else {
          res.json(data[0]);
        }
      });
    }
  });
});

router.get("/", authRequired, (req, res) => {
  db.query("SELECT * FROM contact", function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      res.json(data);
    }
  });
});

router.get("/:id", authRequired, (req, res) => {
  db.query(
    "SELECT * FROM contact WHERE id = ?",
    [req.params.id],
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        res.json(data[0]);
      }
    }
  );
});

router.delete("/:id", authRequired, (req, res) => {
  db.query(
    "DELETE FROM contact WHERE id = ?",
    [req.params.id],
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        res.json({ success: true });
      }
    }
  );
});

module.exports = router;
