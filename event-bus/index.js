const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
app.use(bodyParser.json());
app.use(cors());

const events = [];

app.get("/events", (req, res) => {
  res.send(events);
});

app.post("/events", (req, res) => {
  const { event } = req.body;
  events.push(event);
  try {
    axios.post("http://posts-clusterip-srv:4000/events", event);
    axios.post("http://comments-clusterip-srv:4001/events", event);
    axios.post("http://query-clusterip-srv:4002/events", event)?.catch((e) => {
      console.log("Query service fails");
    });
    axios.post("http://moderation-clusterip-srv:4003/events", event);
    res.send({ status: "ok" });
  } catch (error) {
    console.log("===error=", error?.message);
  }
});

app.listen(4005, () => {
  console.log("Event service is listening on 4005");
});
