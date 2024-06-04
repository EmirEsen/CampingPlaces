const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const { campgroundSchema } = require('./schemas.js');
const catchAsync = require('./utils/CatchAsync');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/YelpCamp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { console.log('Database connected') });

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.send('Hello  World!')
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campground/new', (req, res) => {
    res.render('campgrounds/new');
});

app.get('/campground/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/show', { camp });
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.Campground) throw new ExpressError('Invalid campground data', 400);
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campground/${newCamp.id}`);
}));

app.get('/campground/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).then((camp) => {
        res.render('campgrounds/edit', { camp });
    });
}));

app.put('/campground/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campground/${id}`);
}));

app.delete('/campground/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
}));

app.post('/campgrounds/:id/reviews', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campground/${campground.id}`);
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
});


app.listen(3000, () => { console.log('Listening on Port 3000') });