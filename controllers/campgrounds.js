const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoding = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.Campground) throw new ExpressError('Invalid campground data', 400);
    const geoData = await geocoding.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', ' Succesfully made a new campground!');
    res.redirect(`/campgrounds/${newCamp.id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Cannot find that camground!!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).then((camp) => {
        if (!camp) {
            req.flash('error', 'Cannot find that camground!!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', { camp });
    });
};

module.exports.updatecampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', `successfully updated campground ${campground.title}`);
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (camp.author.equals(req.user._id)) {
        for (i in camp.images) {
            await cloudinary.uploader.destroy(camp.images[i].filename);
        };
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Successfully Deleted Campground!');
    }
    res.redirect(`/campgrounds`);
};