const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();
const cors = require('cors')


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors())

mongoose.connect(process.env.MONGO_URI, {
    user: process.env.MONGO_USERNAME,
    pass: process.env.MONGO_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function(err) {
    if (err) {
        console.log("MongoDB Connection Error: " + err)
    } else {
        console.log("MongoDB Connection Successful")
    }
})

var Schema = mongoose.Schema;

var dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});
var planetModel = mongoose.model('planets', dataSchema);

const planetsData = [
    {
        "id": 1,
        "name": "Mercury",
        "description": "Mercury is the smallest planet in our solar system, and the nearest to the Sun.",
        "image": "images/mercury.png",
        "velocity": 47.4,
        "distance": 57.9
    },
    {
    "id": 2,
    "name": "Venus",
    "description": "Venus is the second planet from the Sun, and Earth's closest planetary neighbor.",
    "image": "images/venus.png",
    "velocity": 35,
    "distance": 108.2
    },
    {
    "id": 3,
    "name": "Earth",
    "description": "Earth – our home planet – is the third planet from the Sun, and the fifth largest planet.",
    "image": "images/earth.png",
    "velocity": 29.8,
    "distance": 149.6
    },
    {
        "id": 4,
        "name": "Mars",
        "description": "Mars – the fourth planet from the Sun – is a dusty, cold, desert world with a very thin atmosphere.",
        "image": "images/mars.png",
        "velocity": 24.1,
        "distance": 228
    },
    {
        "id": 5,
        "name": "Jupiter",
        "description": "Jupiter is the largest planet in our solar system – if it were a hollow shell, 1,000 Earths could fit inside.",
        "image": "images/jupiter.png",
        "velocity": 13.1,
        "distance": 778.5
    },
    {
        "id": 6,
        "name": "Saturn",
        "description": "Saturn is the sixth planet from the Sun, the second-largest planet in our solar system.",
        "image": "images/saturn.png",
        "velocity": 9.7,
        "distance": 1432
    },
    {
        "id": 7,
        "name": "Uranus",
        "description": "The seventh planet from the Sun, Uranus has the third largest diameter of planets in our solar system.",
        "image": "images/uranus.png",
        "velocity": 6.8,
        "distance": 2867
    },
    {
        "id": 8,
        "name": "Neptune",
        "description": "Neptune is the eighth and most distant planet in our solar system.",
        "image": "images/neptune.png",
        "velocity": 5.4,
        "distance": 4515
    }
];

planetModel.insertMany(planetsData, function (err, docs) {
    if (err) {
        console.log("Error inserting data: " + err);
    } else {
        console.log("Data inserted successfully: ", docs);
    }
});

app.post('/planet',   function(req, res) {
    console.log("Received Planet ID " + req.body.id)
    planetModel.findOne({
        id: req.body.id
    }, function(err, planetData) {
        if (err) {
            alert("Ooops, We only have 9 planets and a sun. Select a number from 0 - 9")
            res.send("Error in Planet Data")
        } else {
            res.send(planetData);
        }
    })
})

app.get('/',   async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});


app.get('/os',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
})

app.get('/live',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "live"
    });
})

app.get('/ready',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "ready"
    });
})

app.listen(3000, () => {
    console.log("Server successfully running on port - " +3000);
})


module.exports = app;
