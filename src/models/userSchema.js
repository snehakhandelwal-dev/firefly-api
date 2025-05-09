const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
        },
        userName: {
            type: String,
            unique:true,
        },
        email: {
            type: String,
        },
        phoneNo: {
            type: String,
        },
        password: {
            type: String
        },
        confirmPassword: {
            type: String,
        },
        gender:{
            type:String,
        },
        avatar:{
            type:String,
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
