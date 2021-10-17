const express = require('express');
const router = express.Router();

const Joi = require('joi');
const axios = require('axios');
const connection = require('../../dbConnection');

router.post('/', (req, res) => {
    let result;
    console.log(req.body);
    if (req.body.grant_type === 'authorization_code') {
        const schema = Joi.object({
            client_id: Joi.string(),
            grant_type: Joi.string(),
            redirect_uri: Joi.string(),
            code: Joi.string(),
            scope: Joi.string(),
            url: Joi.string()
        });

        result = schema.validate({
            client_id: req.body.client_id,
            grant_type: req.body.grant_type,
            redirect_uri: req.body.redirect_uri,
            code: req.body.code,
            scope: req.body.scope,
            url: req.body.url
        });
    } else if (req.body.grant_type === 'refresh_token') {
        const schema = Joi.object({
            client_id: Joi.string(),
            grant_type: Joi.string(),
            redirect_uri: Joi.string(),
            refresh_token: Joi.string(),
            scope: Joi.string(),
            url: Joi.string()
        });

        result = schema.validate({
            client_id: req.body.client_id,
            grant_type: req.body.grant_type,
            redirect_uri: req.body.redirect_uri,
            refresh_token: req.body.refresh_token,
            scope: req.body.scope,
            url: req.body.url
        });
    }

    if (result.error) {
        res.status(result.error.status).send(result.error.details);
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
    const params = new URLSearchParams();
    if (req.body.grant_type === 'authorization_code') {
        params.append('client_id', req.body.client_id);
        params.append('client_secret', client_secret);
        params.append('grant_type', req.body.grant_type);
        params.append('redirect_uri', req.body.redirect_uri);
        params.append('code', req.body.code);
        params.append('scope', req.body.scope);
    } else if (req.body.grant_type === 'refresh_token') {
        params.append('client_id', req.body.client_id);
        params.append('client_secret', client_secret);
        params.append('grant_type', req.body.grant_type);
        params.append('redirect_uri', req.body.redirect_uri);
        params.append('refresh_token', req.body.refresh_token);
        params.append('scope', req.body.scope);
    }
    axios
        .post(`${url}/oauth/access_token`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/vnd.c2logbook.v1+json'
            }
        })
        .then((response) => {
            updateUserToken(url, response, req.body.grant_type);

            res.send(response.data);
        })
        .catch((error) => {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                res.status(error.response.status).send(error.message);
            } else if (error.request) {
                console.log(error.request);
                res.send(`${error.message}\n${error.request}`);
            } else {
                console.log('Error', error.message);
                res.send(error.message);
            }
        });
}

function updateUserToken(url, res) {
    axios
        .get(`${url}/api/users/me`, {
            headers: {
                authorization: `${res.data.token_type} ${res.data.access_token}`
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
        })
        .catch((error) => {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                res.status(error.response.status).send(error.message);
            } else if (error.request) {
                console.log(error.request);
                res.send(`${error.message}\n${error.request}`);
            } else {
                console.log('Error', error.message);
                res.send(error.message);
            }
        });
}

module.exports = router;
