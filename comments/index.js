const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const axios = require("axios");

const { randomBytes } = require("crypto");

app.use(bodyParser.json());
app.use(cors());

const commentsByPostsId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostsId[req.params.id]);
});
app.post("/posts/:id/comments", async (req, res) => {
  let id = randomBytes(4).toString("hex");
  const { content } = req.body;
  const comments = commentsByPostsId[req.params.id] || [];
  comments.push({ id, content, status: "pending" });
  commentsByPostsId[req.params.id] = comments;

  await axios.post("http://event-bus-srv:4005/events", {
    event: {
      type: "CommentCreated",
      data: {
        id: id,
        content,
        status: "pending",
        postId: req.params.id,
      },
    },
  });
  res.status(201).send(commentsByPostsId[req.params.id]);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  try {
    if (type === "CommentModerated") {
      const { id, postId, content, status } = data;
      let comments = commentsByPostsId[data?.postId];
      let updatedComment = comments?.find((t) => {
        return t.id === data.id;
      });
      updatedComment.status = data.status;

      await axios.post("http://event-bus-srv:4005/events", {
        event: {
          type: "CommentUpdated",
          data: { id, postId, content, status },
        },
      });
    }
  } catch (error) {
    console.log("===Comment Service===", error?.message);
  }
  res.send({});
});

app.listen(4001, () => {
  console.log("Comment service listening on 4001");
});
