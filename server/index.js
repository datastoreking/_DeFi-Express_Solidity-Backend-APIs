require("dotenv").config();
const express = require("express");
const cors = require('cors');
const PORT = process.env.PORT || 3001;
var app  = express();
const bodyParser = require('body-parser');
var api = require('./routes/api');
var auth = require('./routes/auth');

app.set('port', PORT);
const server = require('http').createServer(app);

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Gamifly." });
});

app.use('/auth', auth);
app.use('/api', api);

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});