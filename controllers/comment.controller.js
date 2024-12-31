const Comment = require("../models/comment.model.js");
const Post = require("../models/post.model.js");
const mongoose = require("mongoose");

// Get all comments with pagination
const getComments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const comments = await Comment.find({})
            .populate("author", "username")
            .populate("post", "content")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const totalComments = await Comment.countDocuments();

        res.status(200).json({
            totalComments,
            totalPages: Math.ceil(totalComments / limit),
            currentPage: parseInt(page),
            comments,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single comment by ID
const getSingleComment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }

        const comment = await Comment.findById(id)
            .populate("author", "username")
            .populate("post", "content")
            .lean();

        if (!comment) {
            return res.status(404).json({ message: "Komment topilmadi" });
        }

        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new comment
const createComment = async (req, res) => {
    try {
        const { postId, content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Bunday nashr topilmadi" });
        }

        const comment = await Comment.create({
            content,
            author: req.user.id,
            post: postId,
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit a comment
const editComment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Komment topilmadi" });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Siz ushbu kommentni tahrirlash huquqiga ega emassiz!" });
        }

        comment.content = req.body.content;
        await comment.save();

        const updatedComment = await Comment.findById(id)
            .populate("author", "username")
            .populate("post", "content")
            .lean();

        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Komment topilmadi" });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Siz ushbu kommentni o'chirish huquqiga ega emassiz!" });
        }

        await Comment.findByIdAndDelete(id);

        res.status(200).json({ message: "Komment borsa kelmasga ketdi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Like a comment
const likeComment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Komment topilmadi" });
        }

        if (comment.likes.includes(req.user.id)) {
            return res.status(400).json({ message: "Siz allaqachon ushbu kommentni yoqtirgansiz!" });
        }

        comment.likes.push(req.user.id);
        await comment.save();

        res.status(200).json({ message: "Komment yoqdi", comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dislike a comment
const dislikeComment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Komment topilmadi" });
        }

        if (!comment.likes.includes(req.user.id)) {
            return res.status(400).json({ message: "Siz ushbu kommentni yoqtirmagansiz!" });
        }

        comment.likes = comment.likes.filter((userId) => userId.toString() !== req.user.id);
        await comment.save();

        res.status(200).json({ message: "Komment yoqmay qoldi", comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reply to a comment
const replyToComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }

        if (!content || typeof content !== "string" || content.trim() === "") {
            return res.status(400).json({ message: "Reply mazmuni bo'sh bo'lishi mumkin emas!" });
        }

        const parentComment = await Comment.findById(id);
        if (!parentComment) {
            return res.status(404).json({ message: "Komment topilmadi" });
        }

        const reply = new Comment({
            content,
            author: req.user.id,
            post: parentComment.post, // Associate the reply with the same post
        });

        await reply.save();

        parentComment.replies.push(reply._id);
        await parentComment.save();

        res.status(201).json({ message: "Reply qo'shildi", reply });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove a reply
const removeReply = async (req, res) => {
    try {
        const { id, replyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(replyId)) {
            return res.status(400).json({ message: "Invalid IDs" });
        }

        const parentComment = await Comment.findById(id);
        if (!parentComment) {
            return res.status(404).json({ message: "Komment topilmadi" });
        }

        if (!parentComment.replies.includes(replyId)) {
            return res.status(400).json({ message: "Reply bu kommentga tegishli emas" });
        }

        const reply = await Comment.findById(replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply topilmadi" });
        }

        if (reply.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Siz ushbu replyni o'chirish huquqiga ega emassiz!" });
        }

        parentComment.replies = parentComment.replies.filter((rId) => rId.toString() !== replyId);
        await parentComment.save();

        await Comment.findByIdAndDelete(replyId);

        res.status(200).json({ message: "Reply o'chirildi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getComments,
    getSingleComment,
    createComment,
    editComment,
    deleteComment,
    likeComment,
    dislikeComment,
    replyToComment,
    removeReply,
};
