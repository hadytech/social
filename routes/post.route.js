const express = require("express");
const authenticate = require("../middlewares/auth.middleware.js");
const {
    getPosts,
    getSinglePost,
    createPost,
    editPost,
    deletePost,
    likePost,
    dislikePost,
    addCommentToPost,
    deleteCommentFromPost,
    repostPost,
    removeRepost,
} = require("../controllers/post.controller.js");

const router = express.Router();

// Public routes
router.get("/", getPosts); // Get all posts
router.get("/:id", getSinglePost); // Get a single post by ID

// Protected routes
router.post("/", authenticate, createPost); // Create a new post
router.put("/:id", authenticate, editPost); // Edit a post by ID
router.delete("/:id", authenticate, deletePost); // Delete a post by ID
router.put("/:id/like", authenticate, likePost); // Like a post
router.put("/:id/dislike", authenticate, dislikePost); // Dislike a post
router.post("/:id/comments", authenticate, addCommentToPost); // Add a comment to a post
router.delete("/:id/comments/:commentId", authenticate, deleteCommentFromPost); // Delete a comment from a post
router.post("/:id/repost", authenticate, repostPost); // Repost a post
router.delete("/:id/repost", authenticate, removeRepost); // Remove a repost

module.exports = router;
