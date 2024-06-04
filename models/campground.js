const { ref } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    image: String,
    location: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});


module.exports = mongoose.model('Campground', campgroundSchema);
