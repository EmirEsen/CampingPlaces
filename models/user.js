const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const U = new Schema({
    enail: {
        type: String,
        required: true,
        unique: true
    }
});

U.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)

