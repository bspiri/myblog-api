const router = require("express").Router();
const db = require("../db");
const sha512 = require("js-sha512");
const jwt = require("jsonwebtoken");
const config = require("../config");
const authRequired = require("../authRequired");

router.get("/", (req, res) => {
  db.query("SELECT * from portfolio", function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      res.json(data);
    }
  });
});

router.get("/:id", (req, res) => {
  db.query(
    "SELECT * from portfolio WHERE id = ?",
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

router.put("/:id", authRequired, (req, res) => {
  db.query(
    "UPDATE portfolio SET title  = ?, content  = ?, url  = ?, image_path = ? WHERE id = ?",
    [
      req.body.title,
      req.body.content,
      req.body.url,
      req.body.image_path,
      req.params.id,
    ],
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        db.query(
          "SELECT * FROM portfolio WHERE id = ?",
          [req.params.id],
          function (err, data) {
            if (err) {
              res.status(500).send("sql error");
            } else {
              res.json(data[0]);
            }
          }
        );
      }
    }
  );
});

router.delete("/:id", authRequired, (req, res) => {
  db.query(
    "DELETE FROM portfolio WHERE id = ?",
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

router.post("/", authRequired, (req, res) => {
  const sql = `INSERT INTO portfolio (title, content, url, image_path) VALUES ('${req.body.title}', '${req.body.content}', '${req.body.url}', '${req.body.image_path}')`;
  db.query(sql, function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      //insert is successful. Get insertId from database
      const lastInsertedPortfolioId = data.insertId;
      const sql2 = `SELECT * FROM portfolio WHERE id = ${lastInsertedPortfolioId}`;
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
