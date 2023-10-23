const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
app.use(bodyParser.json());
app.use(cors());
const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts/create", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };
  await axios.post("http://event-bus-srv:4005/events", {
    event: {
      type: "PostCreated",
      data: {
        id,
        title,
      },
    },
  });
  res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
  res.send({});
});

app.listen(4000, () => {
  console.log("====>v310");
  console.log("Post service listening on 4000");
});
