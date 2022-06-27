const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const querystring = require('querystring');
const app = express();










app.use(express.static(path.join(__dirname, 'www')));  // try to serve static files

const server = http.createServer(app);
server.listen(8080, function () {
  console.log("Express server started");
});
