#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const tokens = require('./router/oauth/access_token');

const cors = require('./middleware/cors');

const express = require('express');
const app = express();

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`app: ${app.get('env')}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors);
app.use('/oauth/access_token', tokens);
require('./middleware/prod')(app);

const port = process.env.PORT || 3000;
let options;

if (app.get('env') === 'development') {
    options = {
        key: fs.readFileSync('cert/localhost.key'),
        cert: fs.readFileSync('cert/localhost.crt')
    };
} else {
    options = {
        key: fs.readFileSync('cert/server.key'),
        cert: fs.readFileSync('cert/server.crt'),
        ca: fs.readFileSync('cert/gd_bundle.crt')
    };
}

https
    .createServer(options, app)
    .listen(port, () => console.log(`Listening to port ${port}`));
