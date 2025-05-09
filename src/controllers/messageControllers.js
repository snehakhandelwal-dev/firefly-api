const ConversationModel = require("../models/conversationSchema");
const MessageModel = require("../models/messageSchema");

// exports.sendMessage = async (req, res) => {
//     try {
//       const senderId = req.params.userId;
//       const receiverId = req.params.receiverId;
//       const message = req.body.message;
  
//       console.log("Sender ID:", senderId);
//       console.log("Receiver ID:", receiverId);
//       console.log("Message:", message);
  
//       if (!senderId || !receiverId || !message) {
//         return res.status(400).json({ message: "All fields are required" });
//       }
  
//       let conversation = await ConversationModel.findOne({
//         participants: { $all: [senderId, receiverId] }
//       });
  
//       console.log("Existing Conversation:", conversation);
  
//       if (!conversation) {
//         conversation = await ConversationModel.create({
//           participants: [senderId, receiverId],
//           messages: []
//         });
//       }
  
//       console.log("Updated Conversation:", conversation);
  
//       const newMessage = await MessageModel.create({
//         senderId,
//         receiverId,
//         message
//       });
//       console.log("New Message:", newMessage);
//       if (newMessage) {
//         console.log("Before pushing to conversation:", conversation.messages);
//         conversation.messages.push(newMessage._id);
//         console.log("After pushing:", conversation.messages);
//         await ConversationModel.findByIdAndUpdate(
//             conversation._id,
//             { $push: { messages: newMessage._id } },
//             { new: true } // Ensures updated conversation is returned
//           );
//       }
      
  
//       res.status(200).json({
//         success: true,
//         responseData: {
//           newMessage
//         }
//       });
//     } catch (error) {
//       console.error("Error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Server error",
//         error: error.message
//       });
//     }
//   };




  
  
//   exports.getMessage = async (req, res) => {
//     try {
//         const myId = req.params.userId;
//         const otherparticipantId = req.params.receiverId;

//         console.log("Sender ID:", myId);
//         console.log("Receiver ID:", otherparticipantId);

//         if (!myId || !otherparticipantId) {
//             return res.status(400).json({ message: "Sender ID and Receiver ID are required" });
//         }

//         // Find the conversation
//         const conversation = await ConversationModel.findOne({
//             participants: { $all: [myId, otherparticipantId] }
//         }).populate("messages"); // Populate messages

//         if (!conversation) {
//             return res.status(404).json({ message: "No conversation found" });
//         }

//         res.status(200).json({
//             success: true,
//             responseData: conversation.messages // Send messages array
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error.message
//         });
//     }
// };

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.params.userId;
    const receiverId = req.params.receiverId;
    const message = req.body.message;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [senderId, receiverId],
        messages: []
      });
    }

    const newMessage = await MessageModel.create({
      senderId,
      receiverId,
      message
    });

    await ConversationModel.findByIdAndUpdate(
      conversation._id,
      { $push: { messages: newMessage._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      responseData: { newMessage }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getMessage = async (req, res) => {
  try {
    const myId = req.params.userId;
    const otherparticipantId = req.params.receiverId;

    if (!myId || !otherparticipantId) {
      return res.status(400).json({ message: "Sender ID and Receiver ID are required" });
    }

    const conversation = await ConversationModel.findOne({
      participants: { $all: [myId, otherparticipantId] }
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({ success: true, responseData: [] });
    }

    res.status(200).json({ success: true, responseData: conversation.messages });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};