const express = require('express');
const router = express.Router();

const axios = require('axios');
const connection = require('../../dbConnection');

router.get('/', (req, res) => {
    console.log(req);
    connection.query(
        'select access_token from tokens where user_id like ?;',
        [req.body.user_id],
        (err, rows) => {
            if (err) throw err;
            if (rows[0] !== undefined) {
                console.log(rows[0].access_token);
                getResults(res, req.body.url, rows[0].access_token);
            } else {
                if (!res.headersSent) res.status(400).send(rows);
            }
        }
    );
});

function getResults(res, url, access_token, user_id) {
    axios
        .get(`${url}/api/users/${user_id}/results`, {
            headers: {
                authorization: `Bearer ${access_token}`
            }
        })
        .then((response) => {
            console.log(response);
            res.data(response);
        })
        .catch((error) => {
            console.log(error);
            res.status(401).send(error.message);
        });
}

module.exports = router;
