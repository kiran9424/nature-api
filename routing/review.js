const express = require('express');
const router = express.Router();

const {createReview,getAllReviews} = require('../controllers/review')
const {checkForAuthorizedUsers,checkRoles} = require('../controllers/auth')

router.post('/:tourId/createreview',checkForAuthorizedUsers,createReview);
router.get('/reviews',getAllReviews);

module.exports = router;