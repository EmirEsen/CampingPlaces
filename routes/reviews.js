const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/CatchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const Campground = require('../models/campground');
const { reviewSchema } = require('../schemas.js');
const Review = require('../models/review');

const reviews = require('../controllers/reviews');

router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;