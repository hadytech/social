const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Ismingizni yozish majburiy!"],
        unique: true, // This automatically creates a unique index
    },
    email: {
        type: String,
        unique: true, // This automatically creates a unique index
        sparse: true, // Allows null or undefined values to coexist with unique constraints
    },
    password: {
        type: String,
        required: [true, "Parol qo'yish ham majburiy!"],
    },
    encryptedData: {
        type: String, // Store encrypted password data here
    },
    iv: {
        type: String, // Store initialization vector for encryption here
    },
    fullName: {
        type: String,
        default: "Foydalanuvchi",
    },
    birth: {
        type: Date,
        required: [true, "Yoshingizga mos tarkibni ko'rish uchun kiritishingiz kerak!"],
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "Jinsingizni tanlang!"],
    },
    muslim: {
        type: Boolean,
        required: [true, "Musulmonmisiz?"],
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    reposts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    followersCount: {
        type: Number,
        default: 0,
    },
    followingCount: {
        type: Number,
        default: 0,
    },
    totalLikesReceived: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Remove any explicit calls to `index` for fields already defined with `unique: true`
// UserSchema.index({ username: 1 }); // REMOVE this if it's already defined
// UserSchema.index({ email: 1 }); // REMOVE this if it's already defined

const User = mongoose.model("User", UserSchema);

module.exports = User;
