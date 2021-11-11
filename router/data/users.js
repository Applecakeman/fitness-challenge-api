const express = require('express');
const router = express.Router();

const Joi = require('joi');
const axios = require('axios');

router.get('/:id', (req, res) => {
  let result;

  console.log(req.headers);
  console.log(req.body);

  const schema = Joi.object({
    url: Joi.string(),
    access_token: Joi.string()
  });

  result = schema.validate({
    url: req.body.url,
    access_token: req.body.access_token
  });

  if (result.error) {
    res.status(result.error.status).send(result.error.details);
    console.log('Error occured');
    return;
  }
  getUserData(req, res);
});

async function getUserData(req, res) {
  try {
    const resp = await axios.get(`${req.body.url}/api/users/${req.params.id}`, {
      headers: {
        authorization: `Bearer ${req.body.access_token}`
      }
    });

    console.log(resp.data);
    res.send(resp.data);
  } catch (err) {
    console.error(err.message);
    res.send(err);
  }
}

router.get('/:id/results', (req, res) => {
  let result;

  console.log(req.headers);
  console.log(req.body);

  const schema = Joi.object({
    url: Joi.string(),
    access_token: Joi.string()
  });

  result = schema.validate({
    url: req.body.url,
    access_token: req.body.access_token
  });

  if (result.error) {
    res.status(result.error.status).send(result.error.details);
    console.log('Error occured');
    return;
  }
  getResultData(req, res);
});

async function getResultData(req, res) {
  try {
    const resp = await axios.get(
      `${req.body.url}/api/users/${req.params.id}/results`,
      {
        headers: {
          authorization: `Bearer ${req.body.access_token}`
        }
      }
    );

    console.log(resp.data);
    res.send(resp.data);
  } catch (err) {
    console.error(err.message);
    res.send(err);
  }
}

module.exports = router;
