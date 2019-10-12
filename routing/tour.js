const express = require('express');
const router = express.Router();
const {createTour,findTourById,findAllTour,getTourStats,findToursUsingQueryParam} = require('../controllers/tour')
const {checkForAuthorizedUsers,checkRoles} = require('../controllers/auth')
// ,checkForAuthorizedUsers,checkRoles('admin')
router.post('/createtour',createTour)
router.get('/tour/:id',findTourById)
router.get('/tour',findAllTour)
router.get('/tour-stats',getTourStats)
router.get('/tourbyprice',findToursUsingQueryParam)



module.exports = router