const router = require("express").Router();
const db = require("../db");
const authRequired = require("../authRequired");

router.get("/", (req, res) => {
  db.query("SELECT * FROM social", function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      res.json(data);
    }
  });
});

router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM social WHERE id = ?",
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

router.post("/", authRequired, (req, res) => {
  const sql = `INSERT INTO social (name, url) VALUES ('${req.body.name}', '${req.body.url}')`;
  db.query(sql, function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      //insert is successful. Get insertId from database
      const lastInsertedSocialId = data.insertId;
      const sql2 = `SELECT * FROM social WHERE id = ${lastInsertedSocialId}`;
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

router.put("/:id", authRequired, (req, res) => {
  db.query(
    "UPDATE social SET name = ?, url = ? WHERE id = ?",
    [req.body.name, req.body.url, req.params.id],
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        db.query(
          "SELECT * FROM social WHERE id = ?",
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
    "DELETE FROM social WHERE id = ?",
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
