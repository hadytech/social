const express = require('express');
const app = express();
const userRoute = require('./routes/user.route.js');
const User = require("./models/user.model.js");
const mongoose = require('mongoose');
// middleware - o'rtakash
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// yo'nalishlar - routes

app.use('/apii/users/', userRoute);

app.get('/', function (req, res) {
    res.send('Hello World')
});

mongoose.connect("mongodb+srv://intergo755:YhozcAApxdOXx82O@cluster0.nvyx8.mongodb.net/Node-API?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("Ma'lumotlar omboriga ulandik!");
        app.listen(3000, () => {
            console.log("Server is here: 3000");

        });

    })
    .catch(() => {
        console.log("Ulanish bekor")
    })