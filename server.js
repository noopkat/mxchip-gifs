require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");
const iothub = require("azure-iothub");
let client, registry;

const port = process.env.PORT || 3000;
const connectionString = process.env.CONNECTION_STRING;
if (connectionString) {
  registry = iothub.Registry.fromConnectionString(connectionString);
  client = iothub.Client.fromConnectionString(connectionString);
}

const app = express();
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/api/devices/list", function(req, res) {
  if (!registry) return res.send([]);

  registry.list((error, list) => {
    const names = list.map(d => d.deviceId);
    res.send(names);
  });
});

app.post("/api/gif", function(req, res) {
  if (!client) return res.sendStatus(500);

  const methodParams = {
    methodName: 'showGif',
    payload: req.body.data,
    timeoutInSeconds: 60
  };

  client.invokeDeviceMethod(req.body.deviceId, methodParams, function(err, result) {
    if (err) {
      console.error(`Failed to invoke method ${methodParams.methodName}: ${err.toString()}`);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

server.listen(port);

