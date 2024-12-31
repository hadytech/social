const mongoose = require("mongoose");
const Post = require("../models/post.model.js");
const Comment = require("../models/comment.model.js");

// Get all posts
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const posts = await Post.find({})
            .populate("author", "username fullName")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const totalPosts = await Post.countDocuments();

        res.status(200).json({
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: parseInt(page),
            posts,
        });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Get a single post with comments
const getSinglePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(id).populate("author", "username fullName").lean();
        if (!post) {
            return res.status(404).json({ message: "Bunday nashr topilmadi" });
        }

        const comments = await Comment.find({ post: id }).populate("author", "username fullName").lean();

        res.status(200).json({ post, comments });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Create a new post
const createPost = async (req, res) => {
    try {
        const { content } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Foydalanuvchi autentifikatsiyadan o'tmagan!" });
        }

        const post = await Post.create({
            content,
            author: req.user.id,
        });

        res.status(201).json(post);
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Edit a post
const editPost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Bunday nashr topilmadi" });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Siz ushbu nashrni tahrirlash huquqiga ega emassiz!" });
        }

        const { content } = req.body;
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { content },
            { new: true }
        ).populate("author", "username fullName").lean();

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Delete a post and its associated comments
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Bunday nashr topilmadi" });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Siz ushbu nashrni o'chirish huquqiga ega emassiz!" });
        }

        await Post.findByIdAndDelete(id);
        await Comment.deleteMany({ post: id });

        res.status(200).json({ message: "Nashr va unga tegishli kommentlar o'chirildi" });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Like a post
const likePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post topilmadi" });
        }

        if (post.likes.includes(req.user.id)) {
            return res.status(400).json({ message: "Siz allaqachon ushbu postni yoqtirgansiz!" });
        }

        post.likes.push(req.user.id);
        await post.save();

        res.status(200).json({ message: "Post yoqdi", post });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Dislike a post
const dislikePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post topilmadi" });
        }

        if (!post.likes.includes(req.user.id)) {
            return res.status(400).json({ message: "Siz ushbu postni yoqtirmagansiz!" });
        }

        post.likes = post.likes.filter((userId) => userId.toString() !== req.user.id);
        await post.save();

        res.status(200).json({ message: "Post yoqmay qoldi", post });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Add a comment to a post
// Add a comment to a post
const addCommentToPost = async (req, res) => {
    try {
        const { id } = req.params; // Post ID
        const { content } = req.body; // Comment content

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        if (!content || typeof content !== "string" || content.trim() === "") {
            return res.status(400).json({ message: "Komment mazmuni bo'sh bo'lishi mumkin emas!" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post topilmadi" });
        }

        const comment = await Comment.create({
            content,
            author: req.user.id, // Authenticated user's ID
            post: id, // Link to the post
        });

        post.comments.push(comment._id); // Add comment to post
        await post.save();

        res.status(201).json({ message: "Komment qo'shildi", comment });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};


// Remove a comment from a post
const deleteCommentFromPost = async (req, res) => {
    try {
        const { id, commentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid IDs" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post topilmadi" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Komment topilmadi" });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Siz ushbu kommentni o'chirish huquqiga ega emassiz!" });
        }

        post.comments = post.comments.filter((cId) => cId.toString() !== commentId);
        await post.save();

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: "Komment o'chirildi" });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Repost a post
const repostPost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post topilmadi" });
        }

        if (post.reposts.includes(req.user.id)) {
            return res.status(400).json({ message: "Siz allaqachon ushbu postni repost qilgansiz!" });
        }

        post.reposts.push(req.user.id);
        await post.save();

        res.status(200).json({ message: "Post repost qilindi", post });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Unrepost a post
const removeRepost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post topilmadi" });
        }

        if (!post.reposts.includes(req.user.id)) {
            return res.status(400).json({ message: "Siz ushbu postni repost qilmagansiz!" });
        }

        post.reposts = post.reposts.filter((userId) => userId.toString() !== req.user.id);
        await post.save();

        res.status(200).json({ message: "Repost bekor qilindi", post });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPosts,
    getSinglePost,
    createPost,
    editPost,
    deletePost,
    likePost,
    dislikePost,
    addCommentToPost, // Ensure this is included
    deleteCommentFromPost,
    repostPost,
    removeRepost,
};


