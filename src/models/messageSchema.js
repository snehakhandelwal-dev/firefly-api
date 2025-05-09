const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        message: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
