const express = require('express');
const router = express.Router();

const Joi = require('joi');
const axios = require('axios');
const connection = require('../../dbConnection');

router.post('/', (req, res) => {
    console.log(req.body);
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
            if (rows[0] !== undefined) {
                authenticateWithApi(req, res, url, rows[0].client_secret);
            } else {
                res.status(400).send('url not found in db');
            }
        }
    );
});

function authenticateWithApi(req, res, url, client_secret) {
    const user_id = 491; //todo get user_id from frontend
    const params = new URLSearchParams();
    if (req.body.grant_type === 'authorization_code') {
        params.append('client_id', req.body.client_id);
        params.append('client_secret', client_secret);
        params.append('grant_type', req.body.grant_type);
        params.append('redirect_uri', req.body.redirect_uri);
        params.append('code', req.body.code);
        params.append('scope', req.body.scope);
    } else if (req.body.grant_type === 'refresh_token') {
        connection.query(
            'select refresh_token from tokens where user_id = ?;',
            [user_id],
            (err, rows) => {
                if (err) throw err;
                if (rows[0] !== undefined) {
                    params.append('client_id', req.body.client_id);
                    params.append('client_secret', client_secret);
                    params.append('grant_type', req.body.grant_type);
                    params.append('redirect_uri', req.body.redirect_uri);
                    params.append('refresh_token', rows[0].refresh_token);
                    params.append('scope', req.body.scope);
                } else {
                    res.status(400).send('refresh token not found in db');
                }
            }
        );
    }
    axios
        .post(url + '/oauth/access_token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/vnd.c2logbook.v1+json'
            }
        })
        .then((response) => {
            if (req.body.grant_type === 'authorization_code')
                updateUserToken(url, response);
            else console.log('refresh_token');

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
