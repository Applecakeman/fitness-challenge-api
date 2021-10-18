const express = require('express');
const router = express.Router();

// const axios = require('axios');
// const connection = require('../../dbConnection');

router.get('/', (req, res) => {
    console.log(req.body);
    res.send({ proof: true });
    // console.log(req.body.user_id);
    // connection.query(
    //     'select access_token from tokens where user_id like ?;',
    //     [req.body.user_id],
    //     (err, rows) => {
    //         if (err) throw err;
    //         if (rows[0] !== undefined) {
    //             console.log(rows[0].access_token);
    //             getResults(
    //                 res,
    //                 req.body.url,
    //                 rows[0].access_token,
    //                 req.body.user_id
    //             );
    //         } else {
    //             res.status(400).send('user access_token not found');
    //         }
    //     }
    // );
});

// function getResults(res, url, access_token, user_id) {
//     axios
//         .get(`${url}/api/users/${user_id}/results`, {
//             headers: {
//                 authorization: `Bearer ${access_token}`
//             }
//         })
//         .then((response) => {
//             // res.send(response.data.data);
//             // console.log(response.data.data);
//             res.send(true);
//         })
//         .catch((error) => {
//             if (error.response) {
//                 console.log(error.response.data);
//                 console.log(error.response.status);
//                 console.log(error.response.headers);
//                 res.status(error.response.status).send(error.message);
//             } else if (error.request) {
//                 console.log(error.request);
//                 res.send(`${error.message}\n${error.request}`);
//             } else {
//                 console.log('Error', error.message);
//                 res.send(error.message);
//             }
//         });
// }

module.exports = router;
