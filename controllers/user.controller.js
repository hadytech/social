const User = require("../models/user.model.js");
const Post = require("../models/post.model.js");
const Comment = require("../models/comment.model.js");
const mongoose = require("mongoose");
const { encrypt } = require("../utils/crypto.utils.js");

// Get all users with their posts, comments, likes, and reposts (with pagination)
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const users = await User.find({})
            .populate("posts", "content createdAt")
            .populate("comments", "content createdAt post")
            .populate("likes", "content author createdAt")
            .populate("reposts", "content author createdAt")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalUsers = await User.countDocuments();
        res.status(200).json({
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            users,
        });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Get a single user with their posts, comments, likes, and reposts
const getSingleUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(id)
            .populate("posts", "content createdAt")
            .populate("comments", "content post createdAt")
            .populate("likes", "content author createdAt")
            .populate("reposts", "content author createdAt")
            .lean();

        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Create a new user
const createUser = async (req, res) => {
    try {
        const { password, ...rest } = req.body;

        if (!password || typeof password !== "string" || password.trim() === "") {
            return res.status(400).json({ message: "Parol majburiy!" });
        }

        const encryptedPassword = encrypt(password);

        const user = await User.create({ ...rest, password: encryptedPassword });
        res.status(201).json(user);
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Edit user details
const editUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findByIdAndUpdate(id, req.body, { new: true }).lean();
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Follow a user
const followUser = async (req, res) => {
    try {
        const { id } = req.params;
        const followerId = req.user?.id;

        if (!followerId || !mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(followerId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (id === followerId) {
            return res.status(400).json({ message: "Siz o'zingizni kuzatolmaysiz" });
        }

        const userToFollow = await User.findById(id);
        const follower = await User.findById(followerId);

        if (!userToFollow || !follower) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        if (follower.following.includes(id)) {
            return res.status(400).json({ message: "Siz allaqachon ushbu foydalanuvchini kuzatyapsiz" });
        }

        userToFollow.followers.push(followerId);
        follower.following.push(id);

        await userToFollow.save();
        await follower.save();

        res.status(200).json({ message: "Kuzatish muvaffaqiyatli qo'shildi" });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const followerId = req.user?.id;

        if (!followerId || !mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(followerId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (id === followerId) {
            return res.status(400).json({ message: "Siz o'zingizni kuzatishni bekor qila olmaysiz" });
        }

        const userToUnfollow = await User.findById(id);
        const follower = await User.findById(followerId);

        if (!userToUnfollow || !follower) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        if (!follower.following.includes(id)) {
            return res.status(400).json({ message: "Siz ushbu foydalanuvchini kuzatmayapsiz" });
        }

        userToUnfollow.followers.pull(followerId);
        follower.following.pull(id);

        await userToUnfollow.save();
        await follower.save();

        res.status(200).json({ message: "Kuzatish bekor qilindi" });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Delete a user and their associated data
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        await Post.deleteMany({ author: id });
        await Comment.deleteMany({ author: id });
        await Post.updateMany({ likes: id }, { $pull: { likes: id } });
        await Post.updateMany({ reposts: id }, { $pull: { reposts: id } });

        res.status(200).json({ message: "Foydalanuvchi va uning faoliyati o'chirildi" });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getSingleUser,
    createUser,
    editUser,
    deleteUser,
    followUser,
    unfollowUser,
};

