const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "Komment mazmuni bo'lishi kerak!"],
            maxlength: 500,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Kommentning muallifi bo'lishi kerak!"],
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: [true, "Komment qaysi postga tegishli ekanligi belgilanmagan!"],
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        replies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        likesCount: {
            type: Number,
            default: 0,
        },
        repliesCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware to auto-update likes and replies counts
CommentSchema.pre("save", function (next) {
    this.likesCount = this.likes.length;
    this.repliesCount = this.replies.length;
    next();
});

// Indexes for improved query performance
CommentSchema.index({ post: 1 });
CommentSchema.index({ author: 1 });

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
