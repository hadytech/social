const express = require("express");
const authenticate = require("../middlewares/auth.middleware.js");
const {
    getUsers,
    getSingleUser,
    createUser,
    editUser,
    deleteUser,
    followUser,
    unfollowUser,
} = require("../controllers/user.controller.js");


const router = express.Router();

// Public routes
router.get("/", getUsers); // Get all users
router.get("/:id", getSingleUser); // Get a single user by ID

// Protected routes
router.post("/", authenticate, createUser); // Create a new user
router.put("/:id", authenticate, editUser); // Edit a user by ID
router.delete("/:id", authenticate, deleteUser); // Delete a user by ID
router.post("/:id/follow", authenticate, followUser); // Follow a user
router.post("/:id/unfollow", authenticate, unfollowUser); // Unfollow a user

module.exports = router;
