const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Ismingizni yozish majburiy!"]
    },
    email: {
        type: String,
        required: false, // Can be omitted since `required` defaults to `false`
    },
    password: {
        type: String,
        required: [true, "Parol qo'yish ham majburiy!"]
    },
    fullName: {
        type: String,
        default: 'Foydalanuvchi',
    },
    birth: {
        type: Date,
        required: [true, "Yoshingizga mos tarkibni ko'rish uchun qachon tug'ilganingizni kiriting!"]
    },
    gender: {
        type: String, // Changed to String
        enum: ['male', 'female'], // Added enum for validation
        required: [true, "Jinsingizni tanlang!"]
    },
    muslim: {
        type: Boolean,
        required: [true, "Musulmonmisiz?"]
    },
}, {
    timestamps: true,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
