const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/CatchAsync');

const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerredUser = await User.register(newUser, password);
        req.flash('success', `Welcome to YelpCamp, ${username}`);
        res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back!');
    res.redirect('/campgrounds');
});

module.exports = router;