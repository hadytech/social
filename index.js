const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const userRoute = require("./routes/user.route.js");
const postRoute = require("./routes/post.route.js");
const commentRoutes = require("./routes/comment.route.js");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoutes);

// Base route
app.get("/", (req, res) => {
    res.json({ 
        message: "Welcome to the API!", 
        routes: ["/api/users", "/api/posts", "/api/comments"] 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// Connect to MongoDB and start the server
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