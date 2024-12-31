const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: [true, "Nashr etish uchun nimadir yozing!"],
            maxlength: 300,
        },
        hashtags: {
            type: [String],
            default: [],
        },
        hidden: {
            type: Boolean,
            default: false,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        reposts: {
            type: Number,
            default: 0,
        },
        commentsCount: {
            type: Number,
            default: 0,
        },
        likesCount: {
            type: Number,
            default: 0,
        },
        hashtagsCount: {
            type: Number,
            default: 0,
        },
        totalCharactersUsed: {
            type: Number,
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Post egasi bo'lishi kerak!"],
        },
    },
    {
        timestamps: true,
    }
);

// Middleware to calculate counts
PostSchema.pre("save", function (next) {
    this.hashtagsCount = this.hashtags.length;
    this.totalCharactersUsed = this.text.length;
    this.commentsCount = this.comments.length;
    this.likesCount = this.likes.length;
    next();
});

// Method to update commentsCount dynamically
PostSchema.methods.updateCommentsCount = async function () {
    try {
        this.commentsCount = this.comments.length;
        await this.save();
    } catch (error) {
        console.error("Error updating comments count:", error.message);
    }
};

// Method to update likesCount dynamically
PostSchema.methods.updateLikesCount = async function () {
    try {
        this.likesCount = this.likes.length;
        await this.save();
    } catch (error) {
        console.error("Error updating likes count:", error.message);
    }
};

// Add indexes for performance
PostSchema.index({ author: 1 });
PostSchema.index({ hashtags: 1 });

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
