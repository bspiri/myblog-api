const router = require("express").Router();
const { response } = require("express");
const db = require("../db");
const authRequired = require("../authRequired");

router.get("/", (req, res) => {
  db.query(
    "SELECT id, title, summary, comment_count, create_date, update_date, image_path from post ORDER BY create_date DESC",
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        res.json(data);
      }
    }
  );
});

router.get("/:id", (req, res) => {
  db.query(
    "SELECT id, title, summary, content, comment_count, create_date, image_path from post WHERE id = ?",
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
  //get current date
  let updateDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  db.query(
    "UPDATE post SET title = ?, summary = ?, content = ?, update_date = ?, image_path = ? WHERE id = ?",
    [
      req.body.title,
      req.body.summary,
      req.body.content,
      updateDate,
      req.body.image_path,
      req.params.id,
    ],
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        db.query(
          "SELECT * FROM post WHERE id = ?",
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
    "DELETE FROM post WHERE id = ?",
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
  const sql = `INSERT INTO post (title, summary, content, image_path) VALUES (?, ?, ?, ?)`;
  db.query(
    sql,
    [req.body.title, req.body.summary, req.body.content, req.body.image_path],
    function (err, data) {
      if (err) {
        console.log(err);
        res.status(500).send("sql error");
      } else {
        //insert is successful. Get insertId from database
        const lastInsertedPostId = data.insertId;
        const tags = req.body.tags;
        const tagsArray = tags.split(",").map((tag) => {
          return tag.trim();
        });
        tagsArray.forEach((tag) => {
          db.query(
            "INSERT INTO tag (name) VALUES (?)",
            [tag],
            function (err, data) {
              if (err) {
                res.status(500).send("sql error");
              } else {
                const lastInsertedTagId = data.insertId;
                db.query(
                  "INSERT INTO post_tag (post_id, tag_id) VALUES (?, ?)",
                  [lastInsertedPostId, lastInsertedTagId],
                  function (err, data) {
                    if (err) {
                      res.status(500).send("sql error");
                    }
                  }
                );
              }
            }
          );
        });

        const sql2 = `SELECT * FROM post WHERE id = ${lastInsertedPostId}`;
        db.query(sql2, function (err, data) {
          if (err) {
            res.status(500).send("sql error");
          } else {
            res.json(data[0]);
          }
        });
      }
    }
  );
});

router.get("/:id/comment", (req, res) => {
  db.query(
    "SELECT * FROM comment WHERE post_id = ?",
    [req.params.id],
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        res.json(data);
      }
    }
  );
});

router.post("/:id/comment", (req, res) => {
  const sql = `INSERT INTO comment (post_id, author, content) VALUES ('${req.params.id}', '${req.body.author}', '${req.body.content}')`;
  db.query(sql, function (err, data) {
    if (err) {
      res.status(500).send("sql error");
    } else {
      //insert is successful. Get insertId from database
      const lastInsertedCommentId = data.insertId;
      const sql2 = `SELECT * FROM comment WHERE id = ${lastInsertedCommentId}`;
      const sql3 = `UPDATE post SET comment_count = comment_count + 1  WHERE id = ?`;
      db.query(sql3, [req.params.id], function (err, data) {
        if (err) {
          res.status(500).send("sql error");
        } else {
          db.query(sql2, function (err, data) {
            if (err) {
              res.status(500).send("sql error");
            } else {
              res.json(data[0]);
            }
          });
        }
      });
    }
  });
});

router.delete("/:id/comment/:comment_id", authRequired, (req, res) => {
  db.query(
    "DELETE FROM comment WHERE id = ?",
    [req.params.comment_id],
    function (err, data) {
      if (err) {
        res.status(500).send("sql error");
      } else {
        db.query(
          "UPDATE post SET comment_count = comment_count - 1 WHERE id = ?",
          [req.params.id],
          function (err, data) {
            if (err) {
              res.status(500).send("sql error");
            } else {
              res.json({ success: true });
            }
          }
        );
      }
    }
  );
});

module.exports = router;
