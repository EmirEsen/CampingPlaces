const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/CatchAsync');

const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const auth = require('../controllers/auth');

router.get('/register', auth.renderRegister);

router.post('/register', catchAsync(auth.registerUser));

router.get('/login', auth.renderLogin);

router.get('/logout', auth.logout);

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), auth.login);

module.exports = router;