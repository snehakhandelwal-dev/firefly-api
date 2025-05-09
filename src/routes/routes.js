const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/userControllers");
const message_controller = require("../controllers/messageControllers");
//-----------Users Controllers----------------

router.post("/users/register", user_controller.register);
router.post("/users/login", user_controller.login);
router.post("/users/logout", user_controller.logout);
router.get("/profile/:userId", user_controller.getProfile);
router.get("/getOtherUsers/:userId", user_controller.getOtherUsers);


//-----------Messages Controllers----------------
router.post("/sendmessage/:userId/:receiverId", message_controller.sendMessage);
router.get("/getmessage/:userId/:receiverId", message_controller.getMessage);

module.exports = router;
