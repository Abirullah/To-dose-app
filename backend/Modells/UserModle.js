import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        default: ""
    },

    otp: String,
    otpExpiresAt: Date,

    verified: { type: Boolean, default: false }


   
}, { timestamps: true });
const UserModel = mongoose.model("User", UserSchema);

export default UserModel;