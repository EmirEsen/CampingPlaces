const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/CatchAsync');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    if (!camp) {
        req.flash('error', 'Cannot find that camground!!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
}));

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.Campground) throw new ExpressError('Invalid campground data', 400);
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    req.flash('success', ' succesfully made a new campground');
    res.redirect(`/campgrounds/${newCamp.id}`);
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).then((camp) => {
        if (!camp) {
            req.flash('error', 'Cannot find that camground!!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', { camp });
    });
}));

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', `successfully updated campground ${camp.title}`);
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted Campground!');
    res.redirect(`/campgrounds`);
}));

module.exports = router;