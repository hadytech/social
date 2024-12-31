const express = require("express");
const authenticate = require("../middlewares/auth.middleware.js");
const {
    getComments,
    getSingleComment,
    createComment,
    editComment,
    deleteComment,
    likeComment,
    dislikeComment,
    replyToComment,
    removeReply,
} = require("../controllers/comment.controller.js");

const router = express.Router();

// Public routes
router.get("/", getComments); // Get all comments
router.get("/:id", getSingleComment); // Get a single comment by ID

// Protected routes
router.post("/", authenticate, createComment); // Create a new comment
router.put("/:id", authenticate, editComment); // Edit a comment by ID
router.delete("/:id", authenticate, deleteComment); // Delete a comment by ID
router.put("/:id/like", authenticate, likeComment); // Like a comment
router.put("/:id/dislike", authenticate, dislikeComment); // Dislike a comment
router.post("/:id/replies", authenticate, replyToComment); // Reply to a comment
router.delete("/:id/replies/:replyId", authenticate, removeReply); // Remove a reply

module.exports = router;
