const router = require("express").Router();
const db = require("../db");
const sha512 = require("js-sha512");
const jwt = require("jsonwebtoken");
const config = require("../config");
const authRequired = require("../authRequired");

router.get("/", authRequired, (req, res) => {
  db.query(
    "SELECT id, name, email, image_path FROM user",
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        res.json(data);
      }
    }
  );
});

router.get("/:id", authRequired, (req, res) => {
  db.query(
    "SELECT id, name, email, image_path FROM user WHERE id = ?",
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
  const hashedPassword = sha512(req.body.password);
  const sql = `INSERT INTO user (name, email, password, image_path) VALUES ('${req.body.name}', '${req.body.email}', '${hashedPassword}', '${req.body.image_path}')`;
  db.query(sql, function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      //insert is successful. Get insertId from database
      const lastInsertedUserId = data.insertId;
      const sql2 = `SELECT id, name, email, image_path FROM user WHERE id = ${lastInsertedUserId}`;
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
  const hashedPassword = sha512(req.body.password);
  db.query(
    "UPDATE user SET name = ?, email = ?, password = ?, image_path = ? WHERE id = ?",
    [
      req.body.name,
      req.body.email,
      hashedPassword,
      req.body.image_path,
      req.params.id,
    ],
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        db.query(
          "SELECT id, name, email, image_path FROM user WHERE id = ?",
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
    "DELETE FROM user WHERE id = ?",
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

router.post("/login", (req, res) => {
  const hashedPassword = sha512(req.body.password);
  const sql = `SELECT id, name, email, image_path from user WHERE email = '${req.body.email}' AND password = '${hashedPassword}'`;
  db.query(sql, function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      if (data.length == 0) {
        // login unsucceessful
        res.status(404).send("user not found");
      } else {
        // create auth token
        const authToken = jwt.sign(
          {
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            image_path: data[0].image_path,
          },
          config.JWT_secret,
          { expiresIn: "1d" }
        );
        res.json({ token: authToken });
      }
    }
  });
});

module.exports = router;
