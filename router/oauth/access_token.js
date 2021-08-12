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

    const url = 'https://log-dev.concept2.com';
    connection.query(
        'select client_secret from apis where url like ?;',
        [url],
        (err, rows) => {
            if (err) throw err;
            authenticateWithApi(req, res, url, rows[0].client_secret);
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
            connection.query(
                'insert into tokens(access_token, refresh_token, token_type, expires_in) values(?,?,?,?);',
                [
                    response.data.access_token,
                    response.data.refresh_token,
                    response.data.token_type,
                    response.data.expires_in
                ],
                (err) => {
                    if (err) throw err;
                }
            );
            getUserData(res, url);
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

function getUserData(res, url) {
    const params = new URLSearchParams();
    params.append('id', 'me');

    axios
        .get(url + '/api/users', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/vnd.c2logbook.v1+json'
            }
        })
        .then((response) => {
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

module.exports = router;
