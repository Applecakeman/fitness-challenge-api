const port = process.env.PORT || 3000;
var https = require('https');
const fs = require('fs');
const Joi = require('joi');
const axios = require('axios');

const options = {
  key: fs.readFileSync('cert/localhost.key'),
  cert: fs.readFileSync('cert/localhost.crt')
};

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.post('/oauth/access_token', (req, res) => {
  const schema = Joi.object({
    client_id: Joi.string(),
    grant_type: Joi.string(),
    redirect_uri: Joi.string(),
    code: Joi.string(),
    scope: Joi.string()
  });

  const result = schema.validate({
    client_id: req.body.client_id,
    grant_type: req.body.grant_type,
    redirect_uri: req.body.redirect_uri,
    code: req.body.code,
    scope: req.body.scope
  });

  if (result.error) {
    res.status(400).send(result.error.details);
    return;
  }

  const params = new URLSearchParams();
  params.append('client_id', req.body.client_id);
  params.append('client_secret', '');
  params.append('grant_type', req.body.grant_type);
  params.append('redirect_uri', req.body.redirect_uri);
  params.append('code', req.body.code);
  params.append('scope', req.body.scope);

  axios
    .post('https://log-dev.concept2.com' + '/oauth/access_token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/vnd.c2logbook.v1+json'
      }
    })
    .then(
      console.log((res) => {
        console.log(res);
        res.send(res.data);
        return res;
      })
    )
    .catch((error) => {
      res.status(error.response.data.status_code).send(error.response.data);
    });
});

https
  .createServer(options, app)
  .listen(port, () => console.log(`Listening to port ${port}`));
