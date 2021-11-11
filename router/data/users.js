const express = require('express');
const router = express.Router();

const axios = require('axios');

router.get('/:url/:access_token/:id', (req, res) => {
  console.log(req.headers);
  console.log(req.params);

  getUserData(req, res);
});

async function getUserData(req, res) {
  try {
    const resp = await axios.get(
      `https://${req.params.url}/api/users/${req.params.id}`,
      {
        headers: {
          authorization: `Bearer ${req.params.access_token}`
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

router.get('/:url/:access_token/:id/results', (req, res) => {
  console.log(req.headers);
  console.log(req.params);

  getResultData(req, res);
});

async function getResultData(req, res) {
  try {
    const resp = await axios.get(
      `https://${req.params.url}/api/users/${req.params.id}/results`,
      {
        headers: {
          authorization: `Bearer ${req.params.access_token}`
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
