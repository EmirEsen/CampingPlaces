const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const axios = require('axios');
const { places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/YelpCamp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { console.log('Database connected') });

const sample = (array) => array[Math.floor(Math.random() * array.length)];


async function seedImg() {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: 'kBkB0Yw8T9qfx_zUIe88A5t87i0MZh0SgjxN6sLzau4',
                collections: 483251
            },
        })
        return resp.data.urls.small
    } catch (err) {
        console.error(err);
    }
};



const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const campground = new Campground({
            author: '666dc2182bb9d72881181ce5',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: await seedImg(),
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                    url: await seedImg()
                    // filename: 'YelpCamp/lyijdcjri8lzthhxanjs',
                }
            ]
        });
        await campground.save();
    };
};

seedDB().then(() => {
    mongoose.connection.close();
});