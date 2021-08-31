const express = require('express');
const router = express.Router();

const Joi = require('joi');
const axios = require('axios');
const connection = require('../../dbConnection');

router.post('/', (req, res) => {
    const schema = Joi.object({
        client_id: Joi.string(),
        grant_type: Joi.string(),
        redirect_uri: Joi.string(),
        code: Joi.string(),
        scope: Joi.string(),
        url: Joi.string()
    });

    const result = schema.validate({
        client_id: req.body.client_id,
        grant_type: req.body.grant_type,
        redirect_uri: req.body.redirect_uri,
        code: req.body.code,
        scope: req.body.scope,
        url: req.body.url
    });

    if (result.error) {
        res.status(400).send(result.error.details);
        return;
    }

    const url = req.body.url;
    connection.query(
        'select client_secret from apis where url like ?;',
        [url],
        (err, rows) => {
            if (err) throw err;
            if (rows[0] !== undefined)
                authenticateWithApi(req, res, url, rows[0].client_secret);
            else {
                res.status(400).send('url not found in db');
            }
        }
    );
});

function authenticateWithApi(req, res, url, client_secret) {
    const params = new URLSearchParams();
    params.append('client_id', req.body.client_id);
    params.append('client_secret', client_secret);
    params.append('grant_type', req.body.grant_type);
    params.append('redirect_uri', req.body.redirect_uri);
    params.append('code', req.body.code);
    params.append('scope', req.body.scope);

    axios
        .post(url + '/oauth/access_token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/vnd.c2logbook.v1+json'
            }
        })
        .then((response) => {
            updateUserToken(url, response);
            res.send(response.data);
        })
        .catch((error) => {
            if (error.response) {
                res.status(error.response.status).send(error.response.data);
            } else {
                res.status(400).send(error.message);
            }
        });
}

function updateUserToken(url, res) {
    axios
        .get(url + '/api/users/me', {
            headers: {
                authorization: res.data.token_type + ' ' + res.data.access_token
            }
        })
        .then((response) => {
            connection.query(
                'replace into tokens(user_id, access_token, refresh_token) values(?,?,?);',
                [
                    response.data.data.id,
                    res.data.access_token,
                    res.data.refresh_token
                ],
                (err) => {
                    if (err) throw err;
                }
            );
        });
}

module.exports = router;
