const config = require('config');

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

const options = {
    key: fs.readFileSync('cert/localhost.key'),
    cert: fs.readFileSync('cert/localhost.crt')
};

const port = process.env.PORT || 3000;

https
    .createServer(options, app)
    .listen(port, () => console.log(`Listening to port ${port}`));
